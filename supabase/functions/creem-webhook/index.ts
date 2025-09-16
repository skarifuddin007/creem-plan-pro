import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function verifyCreemSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return signature === expectedSignature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const creemSignature = req.headers.get('creem-signature');
    const webhookSecret = Deno.env.get('CREEM_WEBHOOK_SECRET');

    console.log('Webhook headers:', Object.fromEntries(req.headers.entries()));
    console.log('Creem signature:', creemSignature);

    // Verify signature if secret is provided
    if (webhookSecret && creemSignature) {
      const isValid = await verifyCreemSignature(rawBody, creemSignature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 401 
          }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('Missing signature or secret - webhook verification skipped');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing signature or secret' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const body = JSON.parse(rawBody);
    console.log('Creem.io webhook received:', body);

    // Extract relevant data from Creem.io webhook
    const { event_type, customer_id, subscription_id, status, user_email } = body;

    console.log('Processing webhook:', { event_type, customer_id, subscription_id, status, user_email });

    // Handle different webhook events
    switch (event_type) {
      case 'payment.succeeded':
      case 'subscription.created':
      case 'subscription.activated':
        // Update user subscription to pro_plus
        if (user_email) {
          const { data: user } = await supabase.auth.admin.getUserByEmail(user_email);
          
          if (user) {
            await supabase
              .from('profiles')
              .update({
                subscription_plan: 'pro_plus',
                subscription_status: 'active',
                creem_customer_id: customer_id
              })
              .eq('user_id', user.id);
            
            console.log('Updated user subscription to pro_plus:', user.id);
          }
        }
        break;

      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'payment.failed':
        // Downgrade user to free plan
        if (user_email) {
          const { data: user } = await supabase.auth.admin.getUserByEmail(user_email);
          
          if (user) {
            await supabase
              .from('profiles')
              .update({
                subscription_plan: 'free',
                subscription_status: status === 'cancelled' ? 'cancelled' : 'inactive'
              })
              .eq('user_id', user.id);
            
            console.log('Downgraded user to free plan:', user.id);
          }
        }
        break;

      default:
        console.log('Unhandled webhook event:', event_type);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process webhook', details: error.message }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});
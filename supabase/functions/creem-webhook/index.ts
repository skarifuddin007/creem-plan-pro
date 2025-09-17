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
    const creemSignature = req.headers.get('creem-signature') || req.headers.get('x-creem-signature');
    const webhookSecret = Deno.env.get('CREEM_WEBHOOK_SECRET');

    console.log('Webhook headers:', Object.fromEntries(req.headers.entries()));
    console.log('Creem signature found:', creemSignature ? 'Yes' : 'No');
    console.log('Webhook secret configured:', webhookSecret ? 'Yes' : 'No');

    // Verify signature if both signature and secret are available
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
      if (!webhookSecret) {
        console.warn('CREEM_WEBHOOK_SECRET not configured in Supabase secrets');
      }
      if (!creemSignature) {
        console.warn('No creem-signature or x-creem-signature header found');
      }
    }

    const body = JSON.parse(rawBody);
    console.log('Creem.io webhook received:', body);

    // Extract relevant data from Creem.io webhook
    const { eventType, object } = body;
    const customer_email = object?.customer?.email;
    const customer_id = object?.customer?.id;
    const subscription_id = object?.subscription?.id;
    const status = object?.status;

    console.log('Processing webhook:', { eventType, customer_email, customer_id, subscription_id, status });

    // Handle different webhook events
    switch (eventType) {
      case 'checkout.completed':
      case 'payment.succeeded':
      case 'subscription.created':
      case 'subscription.activated':
        // Update user subscription to pro_plus
        if (customer_email) {
          const { data: users } = await supabase.auth.admin.listUsers();
          const user = users?.users?.find(u => u.email === customer_email);
          
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
        if (customer_email) {
          const { data: users } = await supabase.auth.admin.listUsers();
          const user = users?.users?.find(u => u.email === customer_email);
          
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
        console.log('Unhandled webhook event:', eventType);
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
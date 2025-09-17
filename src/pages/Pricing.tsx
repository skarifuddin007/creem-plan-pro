import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const features = [
    "Unlimited projects",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
    "API access",
    "Advanced security",
    "Custom branding"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight bg-gradient-hero bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Unlock powerful features and scale your business with our Pro Plus plan. 
            Get everything you need to succeed.
          </p>
        </div>
      </div>

      {/* Free Plan Card */}
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="relative overflow-hidden">
            <CardHeader className="text-center pb-8">
              <h2 className="text-2xl font-bold text-card-foreground">Free Plan</h2>
              <div className="mt-4">
                <span className="text-5xl font-bold text-muted-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Perfect for getting started
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-card-foreground">Basic features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-card-foreground">Limited projects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-card-foreground">Community support</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6">
              <Button 
                variant={profile?.subscription_plan === 'free' ? 'default' : 'outline'}
                size="lg" 
                className="w-full"
                disabled={profile?.subscription_plan === 'free'}
              >
                {profile?.subscription_plan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plus Plan */}
        <Card className="relative overflow-hidden shadow-premium border-2 border-primary/20 bg-gradient-to-b from-card to-primary/5">
          {/* Popular Badge */}
          <div className="absolute -right-10 top-6 rotate-45 bg-accent px-12 py-1 text-xs font-semibold text-accent-foreground">
            POPULAR
          </div>
          
          <CardHeader className="text-center pb-8">
            <h2 className="text-2xl font-bold text-card-foreground">Pro Plus</h2>
            <div className="mt-4">
              <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                $29
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Everything you need to scale your business
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-card-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-6">
            <Button 
              variant="premium" 
              size="lg" 
              className="w-full"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "Sign in required",
                    description: "Please sign in to upgrade your plan.",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (profile?.subscription_plan === 'pro_plus') {
                  toast({
                    title: "Already subscribed",
                    description: "You're already on the Pro Plus plan!",
                  });
                  return;
                }
                
                // Redirect to Creem.io payment with user email and success redirect
                const successUrl = `${window.location.origin}/payment-success`;
                const paymentUrl = `https://www.creem.io/test/payment/prod_4WeSl7nk5ZvdJJFGuw6e1m?customer_email=${encodeURIComponent(user.email || '')}&success_url=${encodeURIComponent(successUrl)}`;
                window.location.href = paymentUrl;
              }}
            >
              {profile?.subscription_plan === 'pro_plus' ? 'Current Plan' : 'Get Started with Pro Plus'}
            </Button>
          </CardFooter>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            30-day money-back guarantee • Cancel anytime • No setup fees
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
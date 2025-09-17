import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    // Check subscription status and wait for it to be updated
    const checkSubscription = async () => {
      if (!user || loading) return;

      // Wait a moment for the webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCheckingStatus(false);
      
      // Show success toast
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. Redirecting to dashboard...",
      });

      // Start countdown timer
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    checkSubscription();
  }, [user, loading, navigate, toast]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase! Your Pro Plus subscription has been activated.
          </p>
          
          {checkingStatus ? (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Processing your subscription...
              </span>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Redirecting to your dashboard in:
              </p>
              <div className="text-3xl font-bold text-primary">
                {redirectCountdown}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              You now have access to all Pro Plus features including unlimited projects, 
              advanced analytics, priority support, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
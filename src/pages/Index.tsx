import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-hero bg-clip-text text-transparent">
            Welcome to Creem.io
          </h1>
          <p className="max-w-2xl text-xl text-muted-foreground">
            The ultimate platform for your business needs. Scale with confidence using our Pro Plus plan.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  Welcome back! You're on the {profile?.subscription_plan || 'free'} plan
                </p>
              </div>
              <Link to="/pricing">
                <Button variant="premium" size="lg">
                  {profile?.subscription_plan === 'pro_plus' ? 'Manage Plan' : 'Upgrade Plan'}
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/auth">
                <Button variant="default" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="premium" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

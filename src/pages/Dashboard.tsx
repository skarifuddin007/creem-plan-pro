import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Crown, Settings, BarChart3, Users, Shield, Zap } from "lucide-react";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPro = profile?.subscription_plan === 'pro_plus';

  const features = [
    { icon: BarChart3, title: "Advanced Analytics", description: "Get detailed insights into your business", enabled: isPro },
    { icon: Users, title: "Team Collaboration", description: "Work together with unlimited team members", enabled: isPro },
    { icon: Shield, title: "Advanced Security", description: "Enterprise-grade security features", enabled: isPro },
    { icon: Zap, title: "API Access", description: "Full API access for custom integrations", enabled: isPro },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Creem.io
              </Link>
              <Badge variant={isPro ? "default" : "secondary"} className="capitalize">
                {isPro && <Crown className="w-3 h-3 mr-1" />}
                {profile?.subscription_plan || 'free'} plan
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to your Dashboard
          </h1>
          <p className="text-muted-foreground">
            {isPro 
              ? "You're all set with Pro Plus! Enjoy unlimited access to all features."
              : "Upgrade to Pro Plus to unlock powerful features for your business."
            }
          </p>
        </div>

        {/* Subscription Status Card */}
        <Card className={`mb-8 ${isPro ? 'border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isPro && <Crown className="w-5 h-5 text-primary" />}
              <span>Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {isPro ? 'Pro Plus Plan' : 'Free Plan'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPro 
                    ? 'You have access to all premium features'
                    : 'Limited features available'
                  }
                </p>
              </div>
              {!isPro && (
                <Link to="/pricing">
                  <Button variant="premium" size="sm">
                    Upgrade Now
                  </Button>
                </Link>
              )}
              {isPro && (
                <Link to="/pricing">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Plan
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.enabled ? 'border-primary/20' : 'opacity-60'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <feature.icon className={`w-5 h-5 ${feature.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{feature.title}</span>
                  {feature.enabled && <Badge variant="secondary" className="text-xs">Active</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
                {!feature.enabled && (
                  <div className="mt-3">
                    <Link to="/pricing">
                      <Button variant="outline" size="sm">
                        Upgrade to Access
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/pricing">
              <Button variant="outline">
                View Pricing
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
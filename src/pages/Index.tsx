// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";

const Index = () => {
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
        
        <div className="flex gap-4 justify-center">
          <Button variant="premium" size="lg" asChild>
            <a href="/pricing">View Pricing Plans</a>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

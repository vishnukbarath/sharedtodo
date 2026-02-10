import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks-page";
import ActivityPage from "@/pages/activity-page";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null; // Or loading spinner

  if (!user) {
    return <AuthPage />;
  }

  // If user is logged in but hasn't completed onboarding (no coupleId)
  // and we aren't already on the onboarding page
  if (!user.coupleId && window.location.pathname !== "/onboarding") {
     return <OnboardingPage />;
  }

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/tasks">
        <ProtectedRoute component={TasksPage} />
      </Route>
      <Route path="/activity">
        <ProtectedRoute component={ActivityPage} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

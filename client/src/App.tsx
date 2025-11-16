import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseProvider } from "@/lib/firebase";
import { Header } from "@/components/Header";
import HomePage from "@/pages/HomePage";
import BrowsePage from "@/pages/BrowsePage";
import KrossfirePage from "@/pages/KrossfirePage";
import PrivateRoomsPage from "@/pages/PrivateRoomsPage";
import QueuePage from "@/pages/QueuePage";
import InterestsSelection from "@/pages/interests-selection";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BrowsePage} />
      <Route path="/player" component={HomePage} />
      <Route path="/krossfire" component={KrossfirePage} />
      <Route path="/private-rooms" component={PrivateRoomsPage} />
      <Route path="/watchlist" component={QueuePage} />
      <Route path="/interests" component={InterestsSelection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  useEffect(() => {
    // Skip onboarding check for interests page itself and when loading
    if (isLoading || location === "/interests") return;

    // If user is logged in but hasn't completed onboarding, redirect to interests
    if (user && !user.hasCompletedOnboarding) {
      navigate("/interests");
    }
  }, [user, isLoading, location, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading Krittics...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Inject dynamic AdSense keywords based on user interests
  useEffect(() => {
    const loadAdKeywords = async () => {
      if (user?.interests && user.interests.length > 0) {
        const { generateAdKeywords, injectAdKeywordsMeta } = await import('@/lib/adsenseKeywords');
        const keywords = generateAdKeywords(user.interests);
        injectAdKeywordsMeta(keywords);
      }
    };
    loadAdKeywords();
  }, [user?.interests]);

  return (
    <OnboardingGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Router />
        </main>
      </div>
    </OnboardingGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseProvider } from "@/lib/firebase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import BrowsePage from "@/pages/BrowsePage";
import KrossfirePage from "@/pages/KrossfirePage";
import PrivateRoomsPage from "@/pages/PrivateRoomsPage";
import QueuePage from "@/pages/QueuePage";
import MissionPage from "@/pages/MissionPage";
import InsightsPage from "@/pages/InsightsPage";
import Article1 from "@/pages/insights/Article1";
import Article2 from "@/pages/insights/Article2";
import Article3 from "@/pages/insights/Article3";
import Article4 from "@/pages/insights/Article4";
import Article5 from "@/pages/insights/Article5";
import Article6 from "@/pages/insights/Article6";
import Article7 from "@/pages/insights/Article7";
import Article8 from "@/pages/insights/Article8";
import InterestsSelection from "@/pages/interests-selection";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BrowsePage} />
      <Route path="/player" component={HomePage} />
      <Route path="/krossfire" component={KrossfirePage} />
      <Route path="/crew" component={PrivateRoomsPage} />
      <Route path="/private-rooms" component={PrivateRoomsPage} />
      <Route path="/watchlist" component={QueuePage} />
      <Route path="/mission" component={MissionPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/insights/article-1" component={Article1} />
      <Route path="/insights/article-2" component={Article2} />
      <Route path="/insights/article-3" component={Article3} />
      <Route path="/insights/article-4" component={Article4} />
      <Route path="/insights/article-5" component={Article5} />
      <Route path="/insights/article-6" component={Article6} />
      <Route path="/insights/article-7" component={Article7} />
      <Route path="/insights/article-8" component={Article8} />
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

function TeaserOverlay() {
  // Only show in production (www.krittics.com)
  if (import.meta.env.MODE !== 'production') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 pointer-events-none"
      style={{ backdropFilter: 'blur(1px)' }}
    >
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wider">
          KRITTICS — LAUNCHING SOON
        </h1>
        <p className="text-sm md:text-base text-white/70 italic">
          (Full site visible to Google reviewers)
        </p>
      </div>
    </div>
  );
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
      <TeaserOverlay />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
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

import { Switch, Route } from "wouter";
import { useEffect } from "react";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/browse" component={BrowsePage} />
      <Route path="/krossfire" component={KrossfirePage} />
      <Route path="/private-rooms" component={PrivateRoomsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Router />
      </main>
    </div>
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

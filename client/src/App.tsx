import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FirebaseProvider, useFirebase } from "@/lib/firebase";
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
  const { userId } = useFirebase();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between">
        <Header userId={userId || ""} />
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
      </div>
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
        <ThemeProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Header } from "@/components/Header";
import HomePage from "@/pages/HomePage";
import KrossfirePage from "@/pages/KrossfirePage";
import MovieLibraryPage from "@/pages/MovieLibraryPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/library" component={MovieLibraryPage} />
      <Route path="/krossfire" component={KrossfirePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Generate a simple user ID for demo purposes
    const storedId = localStorage.getItem("krittics-user-id");
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("krittics-user-id", newId);
      setUserId(newId);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex items-center justify-between">
              <Header userId={userId} />
              <div className="absolute right-4 top-4 z-50">
                <ThemeToggle />
              </div>
            </div>
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

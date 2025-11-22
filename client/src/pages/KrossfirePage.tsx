import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Zap, Users, Trophy, Crown, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
}

export default function KrossfirePage() {
  const [, setLocation] = useLocation();
  const [gameMode, setGameMode] = useState<"lobby" | "waiting" | "playing">("lobby");
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const [waitTimeMs, setWaitTimeMs] = useState(0);
  const { toast } = useToast();

  // Scroll to top when page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('krittics-user-id');

  // Fetch current user to get interests
  const { data: currentUser } = useQuery<{ id: string; interests?: string[] } | null>({
    queryKey: ['/api/auth/user'],
  });

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard/krossfire', timePeriod],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/krossfire?period=${timePeriod}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  // Join matchmaking queue mutation
  const joinQueueMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.interests || currentUser.interests.length === 0) {
        throw new Error("Please select your interests in your profile first to use Quick Match");
      }
      return await apiRequest('POST', '/api/matchmaking/join', {
        interests: currentUser.interests,
      });
    },
    onSuccess: () => {
      setGameMode("waiting");
      setWaitTimeMs(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not join Quick Match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave matchmaking queue mutation
  const leaveQueueMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/matchmaking/leave', {});
    },
    onSuccess: () => {
      setGameMode("lobby");
      setWaitTimeMs(0);
    },
  });

  // Poll matchmaking status while waiting
  useEffect(() => {
    if (gameMode !== "waiting") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/matchmaking/status');
        if (!response.ok) throw new Error('Failed to check match status');
        
        const result = await response.json();
        
        if (result.matched) {
          // Match found! Show success and navigate to game session
          toast({
            title: "Match Found!",
            description: `Matched with ${result.matchedPlayers.length - 1} other player(s). Get ready to compete!`,
            duration: 3000,
          });
          
          // Clear the interval before navigating
          clearInterval(pollInterval);
          
          // Leave the queue before navigating
          await fetch('/api/matchmaking/leave', { method: 'POST' });
          
          // Navigate to the game session lobby (Crew Command Center supports multiplayer games)
          // For now, navigate to crew page where multiplayer games can be played
          // In a full implementation, this would create/join a dedicated Krossfire game session
          setTimeout(() => {
            setLocation(`/crew`);
          }, 1500); // Small delay to show the success toast
          
          return; // Exit early to prevent further polling
        } else if (result.waitTimeMs) {
          setWaitTimeMs(result.waitTimeMs);
        }
      } catch (error) {
        console.error("Error polling match status:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [gameMode, toast, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {gameMode === "lobby" && (
          <div className="mx-auto max-w-5xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <div 
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" 
                style={{ 
                  backgroundColor: 'rgba(27, 169, 175, 0.1)',
                  boxShadow: '0 0 20px rgba(27, 169, 175, 0.2)',
                  color: '#1ba9af'
                }}
              >
                <Zap className="h-10 w-10" />
              </div>
              <h1 className="font-display text-5xl font-extrabold text-foreground">
                Krittics Krossfire
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Compete in diverse trivia and climb the ranks
              </p>
            </div>

            {/* Game Modes */}
            <div className="mb-12 grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden transition-all hover-elevate active-elevate-2">
                <div 
                  className="p-8"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(27, 169, 175, 0.2), rgba(27, 169, 175, 0.05))'
                  }}
                >
                  <div 
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" 
                    style={{ 
                      backgroundColor: '#1ba9af',
                      boxShadow: '0 0 15px rgba(27, 169, 175, 0.4)'
                    }}
                  >
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Quick Match</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Jump into a random game with other players
                  </p>
                  <button
                    className="gradient-border-button mt-6 w-full"
                    onClick={() => {
                      if (!currentUser) {
                        toast({
                          title: "Please log in",
                          description: "You must be logged in to use Quick Match",
                          variant: "destructive",
                        });
                        return;
                      }
                      joinQueueMutation.mutate();
                    }}
                    disabled={joinQueueMutation.isPending}
                    data-testid="button-quick-match"
                  >
                    <span className="gradient-border-content px-6 py-3 text-base font-medium">
                      {joinQueueMutation.isPending ? "Joining..." : "Find Match"}
                    </span>
                  </button>
                </div>
              </Card>

              <Card className="overflow-hidden transition-all hover-elevate active-elevate-2">
                <div 
                  className="p-8"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(27, 169, 175, 0.2), rgba(27, 169, 175, 0.05))'
                  }}
                >
                  <div 
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" 
                    style={{ 
                      backgroundColor: '#1ba9af',
                      boxShadow: '0 0 15px rgba(27, 169, 175, 0.4)'
                    }}
                  >
                    <Crown className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Crew</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    invite your friends and create a Krossfire crew
                  </p>
                  <button
                    className="gradient-border-button mt-6 w-full"
                    onClick={() => setLocation('/private-rooms')}
                    data-testid="button-private-rooms"
                  >
                    <span className="gradient-border-content px-6 py-3 text-base font-medium">
                      Create or Join Crew
                    </span>
                  </button>
                </div>
              </Card>
            </div>

            {/* Leaderboard Preview */}
            <Card className="p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-foreground">Top Players</h2>
                  <span style={{ color: '#1ba9af' }}>
                    <Trophy className="h-6 w-6" />
                  </span>
                </div>
                <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as typeof timePeriod)}>
                  <SelectTrigger className="w-40" data-testid="select-time-period">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="all-time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="ml-auto h-8 w-12" />
                    </div>
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No players yet. Be the first to compete!
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.userId === currentUserId;
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                          isCurrentUser
                            ? "bg-card hover-elevate"
                            : "border-border bg-card hover-elevate"
                        }`}
                        style={isCurrentUser ? {
                          borderColor: '#1ba9af',
                          backgroundColor: 'rgba(27, 169, 175, 0.05)'
                        } : undefined}
                        data-testid={`leaderboard-row-${index}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold ${
                              index === 0
                                ? "text-primary-foreground"
                                : index === 1
                                ? "text-primary-foreground"
                                : index === 2
                                ? "text-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                            style={
                              index === 0
                                ? { backgroundColor: '#1ba9af', boxShadow: '0 0 15px rgba(27, 169, 175, 0.4)' }
                                : index === 1
                                ? { backgroundColor: 'rgba(27, 169, 175, 0.6)', boxShadow: '0 0 10px rgba(27, 169, 175, 0.3)' }
                                : index === 2
                                ? { backgroundColor: 'rgba(27, 169, 175, 0.3)' }
                                : undefined
                            }
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {entry.username}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{entry.gamesPlayed} games</span>
                              <span>•</span>
                              <span>Avg: {entry.averageScore}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={isCurrentUser ? "default" : "secondary"} 
                          className="font-display text-lg"
                          style={isCurrentUser ? {
                            backgroundColor: '#1ba9af',
                            borderColor: '#158f94',
                            color: 'white'
                          } : undefined}
                        >
                          {entry.totalScore}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* How to Play */}
            <Card className="mt-8 bg-muted/30 p-8">
              <h3 className="mb-4 font-display text-xl font-bold text-foreground">How to Play</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="mb-2 font-semibold text-foreground">1. Join a Match</div>
                  <p className="text-sm text-muted-foreground">
                    Get matched with players of similar skill level
                  </p>
                </div>
                <div>
                  <div className="mb-2 font-semibold text-foreground">2. Answer Fast</div>
                  <p className="text-sm text-muted-foreground">
                    Speed and accuracy both matter for your score
                  </p>
                </div>
                <div>
                  <div className="mb-2 font-semibold text-foreground">3. Claim Victory</div>
                  <p className="text-sm text-muted-foreground">
                    Top scorer wins bragging rights and points
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {gameMode === "waiting" && (
          <div className="mx-auto max-w-2xl">
            <Card className="p-12">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center" style={{ color: '#1ba9af' }}>
                  <Users className="h-12 w-12 animate-pulse" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Finding Players...
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Matching you with players who share your interests
                </p>
                
                {waitTimeMs > 0 && (
                  <Badge variant="outline" className="mt-4" style={{ borderColor: '#1ba9af', color: '#1ba9af' }}>
                    <Clock className="mr-2 h-3 w-3" />
                    {Math.floor(waitTimeMs / 1000)}s elapsed
                  </Badge>
                )}

                <div className="mx-auto mt-8 max-w-md">
                  <div className="flex items-center justify-center gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: '#1ba9af',
                          animationDelay: `${i * 150}ms` 
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => leaveQueueMutation.mutate()}
                  className="mt-8"
                  disabled={leaveQueueMutation.isPending}
                  data-testid="button-cancel-match"
                >
                  {leaveQueueMutation.isPending ? "Canceling..." : "Cancel"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

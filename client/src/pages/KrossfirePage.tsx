import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Users, Trophy, Crown, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('krittics-user-id');

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard/krossfire', timePeriod],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/krossfire?period=${timePeriod}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {gameMode === "lobby" && (
          <div className="mx-auto max-w-5xl">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-5xl font-extrabold text-foreground">
                Krittics Krossfire
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Compete in real-time movie trivia battles
              </p>
            </div>

            {/* Game Modes */}
            <div className="mb-12 grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden transition-all hover-elevate active-elevate-2">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Quick Match</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Jump into a random game with other players
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 w-full"
                    onClick={() => setGameMode("waiting")}
                    data-testid="button-quick-match"
                  >
                    Find Match
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden transition-all hover-elevate active-elevate-2">
                <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                    <Crown className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Private Room</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Create a room and invite your friends
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 w-full"
                    onClick={() => setLocation('/private-rooms')}
                    data-testid="button-private-rooms"
                  >
                    Create or Join Room
                  </Button>
                </div>
              </Card>
            </div>

            {/* Leaderboard Preview */}
            <Card className="p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-foreground">Top Players</h2>
                  <Trophy className="h-6 w-6 text-primary" />
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
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover-elevate"
                        }`}
                        data-testid={`leaderboard-row-${index}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold ${
                              index === 0
                                ? "bg-primary text-primary-foreground"
                                : index === 1
                                ? "bg-primary/60 text-primary-foreground"
                                : index === 2
                                ? "bg-primary/30 text-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
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
                        <Badge variant={isCurrentUser ? "default" : "secondary"} className="font-display text-lg">
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
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                  <Users className="h-12 w-12 animate-pulse text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Finding Players...
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Matching you with opponents of similar skill
                </p>

                <div className="mx-auto mt-8 max-w-md">
                  <div className="flex items-center justify-center gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setGameMode("lobby")}
                  className="mt-8"
                  data-testid="button-cancel-match"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Zap, Users, Trophy, Crown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  isCurrentUser: boolean;
}

export default function KrossfirePage() {
  const [gameMode, setGameMode] = useState<"lobby" | "waiting" | "playing">("lobby");

  // Mock players data
  const mockPlayers: Player[] = [
    { id: "1", name: "You", score: 4, streak: 2, isCurrentUser: true },
    { id: "2", name: "CinemaFan92", score: 3, streak: 1, isCurrentUser: false },
    { id: "3", name: "MovieBuff", score: 2, streak: 0, isCurrentUser: false },
    { id: "4", name: "FilmGeek", score: 1, streak: 0, isCurrentUser: false },
  ];

  const sortedPlayers = [...mockPlayers].sort((a, b) => b.score - a.score);

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

              <Card className="overflow-hidden opacity-60 transition-all">
                <div className="bg-gradient-to-br from-muted/50 to-muted/20 p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Crown className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Private Room</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Create a room and invite your friends
                  </p>
                  <Button size="lg" className="mt-6 w-full" variant="secondary" disabled>
                    Coming Soon
                  </Button>
                </div>
              </Card>
            </div>

            {/* Leaderboard Preview */}
            <Card className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-foreground">Top Players Today</h2>
                <Trophy className="h-6 w-6 text-primary" />
              </div>

              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                      player.isCurrentUser
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
                        <div className="font-medium text-foreground">{player.name}</div>
                        {player.streak > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            <span>{player.streak} streak</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={player.isCurrentUser ? "default" : "secondary"} className="font-display text-lg">
                      {player.score}
                    </Badge>
                  </div>
                ))}
              </div>
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

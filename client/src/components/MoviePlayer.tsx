import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Trophy, Film, Bookmark, ThumbsUp, ThumbsDown, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AdSense } from "@/components/AdSense";
import { EnhancedVideoPlayer, type VideoPlayerHandle } from "@/components/EnhancedVideoPlayer";
import type { Movie } from "@shared/schema";
import { useReactions } from "@/lib/reactions";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";


interface MoviePlayerProps {
  movie: Movie;
  onTriviaReady: () => void;
  inQueue?: boolean;
  onToggleQueue?: () => void;
}

export function MoviePlayer({ movie, onTriviaReady, inQueue = false, onToggleQueue }: MoviePlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTriviaButton, setShowTriviaButton] = useState(false);
  const [showTriviaNotification, setShowTriviaNotification] = useState(false);
  const [triviaAutoTriggered, setTriviaAutoTriggered] = useState(false);
  const [manuallyOpenedTrivia, setManuallyOpenedTrivia] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<"like" | "dislike" | null>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const { saveReaction, removeReaction, getReaction, isFirebaseConfigured } = useReactions();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const playerRef = useRef<VideoPlayerHandle>(null);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Load initial progress to check if movie is partially watched
  // Wait for auth to finish loading, then fetch progress regardless of user state
  const { data: initialProgress } = useQuery<{ progressSeconds: number; completed: boolean } | null>({
    queryKey: ['/api/progress', movie.id],
    enabled: !!movie.id && !authLoading,
  });

  // Calculate saved progress in seconds
  const savedProgressSeconds = initialProgress?.progressSeconds || 0;

  // Show buttons only if watched at least 15 seconds and not completed
  const showProgressButtons = savedProgressSeconds >= 15 && !initialProgress?.completed;

  // Reset all trivia states when movie changes
  useEffect(() => {
    setShowTriviaButton(false);
    setTriviaAutoTriggered(false);
    setShowTriviaNotification(false);
    setManuallyOpenedTrivia(false);
  }, [movie.id]);

  // Load user's reaction for this movie
  useEffect(() => {
    const loadReaction = async () => {
      const reaction = await getReaction(movie.id);
      setCurrentReaction(reaction);
    };
    loadReaction();
  }, [movie.id, getReaction]);

  // BUTTON REVEAL: Show trivia button at 3:00 (180 seconds) remaining
  useEffect(() => {
    if (duration > 0 && currentTime > 0 && !showTriviaButton) {
      const timeRemaining = duration - currentTime;
      
      if (timeRemaining <= 180) {
        console.log("Trivia button revealed at 3:00 remaining");
        setShowTriviaButton(true);
      }
    }
  }, [currentTime, duration, showTriviaButton]);

  // AUTO-TRIGGER: Show full-screen trivia at 0:30 (30 seconds) remaining
  // Only trigger if user hasn't manually opened trivia
  useEffect(() => {
    if (duration > 0 && currentTime > 0 && !triviaAutoTriggered && !manuallyOpenedTrivia) {
      const timeRemaining = duration - currentTime;
      
      if (timeRemaining <= 30) {
        console.log("Auto-triggered full-screen trivia at 00:30");
        setTriviaAutoTriggered(true);
        
        // Auto-trigger the full-screen trivia overlay
        onTriviaReady();
        
        toast({
          title: "Deep Dive Trivia Ready!",
          description: "Your trivia challenge is starting now",
          duration: 3000,
        });
      }
    }
  }, [currentTime, duration, triviaAutoTriggered, manuallyOpenedTrivia, onTriviaReady, toast]);

  // Handler for bookmark button
  const handleBookmark = () => {
    if (onToggleQueue) {
      onToggleQueue();
    }
  };

  // Handler for like button
  const handleLike = async () => {
    if (!isFirebaseConfigured) {
      toast({
        title: "Feature unavailable",
        description: "Firebase not configured. Reactions cannot be saved.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      if (currentReaction === "like") {
        // Remove like
        const success = await removeReaction(movie.id);
        if (success) {
          setCurrentReaction(null);
          toast({
            title: "Reaction removed",
            duration: 1000,
          });
        }
      } else {
        // Add like
        const success = await saveReaction(movie.id, "like");
        if (success) {
          setCurrentReaction("like");
          toast({
            title: "Liked",
            duration: 1000,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reaction",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Handler for dislike button
  const handleDislike = async () => {
    if (!isFirebaseConfigured) {
      toast({
        title: "Feature unavailable",
        description: "Firebase not configured. Reactions cannot be saved.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      if (currentReaction === "dislike") {
        // Remove dislike
        const success = await removeReaction(movie.id);
        if (success) {
          setCurrentReaction(null);
          toast({
            title: "Reaction removed",
            duration: 1000,
          });
        }
      } else {
        // Add dislike
        const success = await saveReaction(movie.id, "dislike");
        if (success) {
          setCurrentReaction("dislike");
          toast({
            title: "Disliked",
            duration: 1000,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reaction",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Handler for "Continue Watching" button
  const handleContinueWatching = () => {
    if (playerRef.current && initialProgress) {
      // Seek to saved position and start playing
      playerRef.current.seekTo(initialProgress.progressSeconds);
      // Small delay to ensure seek completes before playing
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.play();
        }
      }, 100);
    }
  };

  // Handler for "Start from Beginning" button
  const startFromBeginningMutation = useMutation({
    mutationFn: async () => {
      // IMMEDIATELY reset progress to 0 in database using the correct endpoint
      // This bypasses the 15-second threshold and ensures reset persists even if user closes browser immediately
      await apiRequest('POST', `/api/progress/${movie.id}`, {
        progressSeconds: 0,
        completed: false,
      });
    },
    onSuccess: () => {
      // Invalidate progress query to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/progress', movie.id] });
      
      // Seek to beginning and play - no page reload!
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.play();
      }
    },
  });

  const handleStartFromBeginning = () => {
    // Fire-and-forget: immediately send reset request before any UI updates
    startFromBeginningMutation.mutate();
  };


  return (
    <div className="relative">
      <Card className="overflow-hidden bg-card">
        <div className="relative aspect-video bg-black">
          {movie.videoUrl ? (
            <EnhancedVideoPlayer
              ref={playerRef}
              src={movie.videoUrl}
              movieId={movie.id}
              onTimeUpdate={(currentTime, duration) => {
                setCurrentTime(currentTime);
                setDuration(duration);
                setHasStartedPlaying(true);
                
                // Calculate progress for trivia notification
                const calculatedProgress = (currentTime / duration) * 100;
                
                // Trigger trivia notification at 95%
                if (calculatedProgress >= 95 && !showTriviaNotification) {
                  setShowTriviaNotification(true);
                }
              }}
              onEnded={() => {
                // Video ended - handled by Video.js
              }}
              className="w-full h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="text-center">
                <Film className="mx-auto h-24 w-24 text-muted-foreground opacity-50" />
                <p className="mt-4 text-lg text-muted-foreground">Video preview for</p>
                <p className="font-display text-2xl font-bold text-foreground">{movie.title}</p>
              </div>
            </div>
          )}
        </div>

        {/* Movie Title & Progress */}
        <div 
          className="p-6 pb-6"
          style={{
            background: 'linear-gradient(to bottom right, rgba(27, 169, 175, 0.2), rgba(27, 169, 175, 0.05))'
          }}
        >
          <h2 className="font-display text-3xl font-bold text-foreground">{movie.title}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(27, 169, 175, 0.2)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: '#1ba9af'
                }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground" data-testid="text-progress">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Continue Watching / Start from Beginning buttons */}
          {showProgressButtons && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #1ba9af 0%, #158a8f 100%)',
                  border: '1px solid rgba(27, 169, 175, 0.3)'
                }}
                onClick={handleContinueWatching}
                data-testid="button-continue-watching"
              >
                <Play className="h-4 w-4" />
                Continue Watching
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleStartFromBeginning}
                disabled={startFromBeginningMutation.isPending}
                data-testid="button-start-from-beginning"
              >
                <RotateCcw className="h-4 w-4" />
                {startFromBeginningMutation.isPending ? "Restarting..." : "Start from Beginning"}
              </Button>
            </div>
          )}
          
          {/* Banner Ad below title */}
          <div className="mt-6">
            <AdSense adSlot="5966285343" adFormat="auto" />
          </div>
        </div>

        {/* Gradient Transition - soft blend from teal to black */}
        <div 
          style={{
            background: 'linear-gradient(to bottom, rgba(27, 169, 175, 0.05) 0%, rgba(0, 0, 0, 0.5) 50%, rgb(0, 0, 0) 100%)',
            height: '20px'
          }}
        />

        {/* Description/Synopsis Section */}
        {movie.description && (
          <div 
            className="px-6 pb-6 pt-2 relative"
            style={{
              background: 'rgb(0, 0, 0)'
            }}
          >
            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={handleBookmark}
                data-testid="button-bookmark-player"
              >
                {inQueue ? <Check className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={handleLike}
                data-testid="button-like-player"
              >
                <ThumbsUp className={`h-5 w-5 ${currentReaction === "like" ? "fill-primary text-primary" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={handleDislike}
                data-testid="button-dislike-player"
              >
                <ThumbsDown className={`h-5 w-5 ${currentReaction === "dislike" ? "fill-primary text-primary" : ""}`} />
              </Button>
              
              {/* Deep-Dive Trivia button - appears at 3:00 remaining */}
              {showTriviaButton && (
                <Button
                  variant="default"
                  className="flex items-center gap-2 animate-in fade-in duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #1ba9af 0%, #158a8f 100%)',
                    border: '1px solid rgba(27, 169, 175, 0.3)'
                  }}
                  onClick={() => {
                    setManuallyOpenedTrivia(true);
                    onTriviaReady();
                  }}
                  data-testid="button-deep-dive-trivia"
                >
                  <Trophy className="h-4 w-4" />
                  Deep-Dive Trivia
                </Button>
              )}
            </div>
            
            {movie.tagline && (
              <div className="mb-6">
                <p className="text-lg italic text-primary font-medium">"{movie.tagline}"</p>
              </div>
            )}
            
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">Synopsis</h3>
            <p className="text-base leading-relaxed text-muted-foreground mb-6">{movie.description}</p>
            
            {/* Movie Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              {movie.director && (
                <div>
                  <span className="font-semibold text-foreground">Director:</span>{" "}
                  <span className="text-muted-foreground">{movie.director}</span>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="font-semibold text-foreground">Cast:</span>{" "}
                  <span className="text-muted-foreground">{movie.cast.join(", ")}</span>
                </div>
              )}
              {movie.studio && (
                <div>
                  <span className="font-semibold text-foreground">Studio:</span>{" "}
                  <span className="text-muted-foreground">{movie.studio}</span>
                </div>
              )}
              {movie.year && (
                <div>
                  <span className="font-semibold text-foreground">Release Year:</span>{" "}
                  <span className="text-muted-foreground">{movie.year}</span>
                </div>
              )}
              {movie.country && (
                <div>
                  <span className="font-semibold text-foreground">Country:</span>{" "}
                  <span className="text-muted-foreground">{movie.country}</span>
                </div>
              )}
              {movie.language && (
                <div>
                  <span className="font-semibold text-foreground">Language:</span>{" "}
                  <span className="text-muted-foreground">{movie.language}</span>
                </div>
              )}
            </div>
            
            {movie.awards && movie.awards.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-primary">🏆</span> Awards & Recognition
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {movie.awards.map((award, index) => (
                    <li key={index}>{award}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trivia notification - positioned absolutely */}
            {showTriviaNotification && (
              <Card 
                className="absolute top-0 right-3 p-2.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-right-4 w-52"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(27, 169, 175, 0.3), rgba(27, 169, 175, 0.1))',
                  borderColor: '#1ba9af'
                }}
              >
                <div className="flex items-start gap-2">
                  <div 
                    className="rounded-full p-1.5 flex-shrink-0" 
                    style={{ 
                      backgroundColor: '#1ba9af',
                      boxShadow: '0 0 15px rgba(27, 169, 175, 0.4)'
                    }}
                  >
                    <Trophy className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-xs">Deep Dive Ready!</h3>
                    <p className="text-xs text-muted-foreground leading-tight">Start trivia</p>
                    <button
                      onClick={onTriviaReady}
                      className="gradient-border-button mt-1.5 w-full"
                      data-testid="button-start-trivia"
                    >
                      <span className="gradient-border-content px-2 py-1 text-xs font-medium">
                        Start Now
                      </span>
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>


    </div>
  );
}

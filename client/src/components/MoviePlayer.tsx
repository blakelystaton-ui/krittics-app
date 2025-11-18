import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Trophy, Film, Bookmark, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AdSense } from "@/components/AdSense";
import { EnhancedVideoPlayer } from "@/components/EnhancedVideoPlayer";
import type { Movie } from "@shared/schema";
import { useReactions } from "@/lib/reactions";
import { useToast } from "@/hooks/use-toast";

interface MoviePlayerProps {
  movie: Movie;
  onTriviaReady: () => void;
  inQueue?: boolean;
  onToggleQueue?: () => void;
}

export function MoviePlayer({ movie, onTriviaReady, inQueue = false, onToggleQueue }: MoviePlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTriviaNotification, setShowTriviaNotification] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<"like" | "dislike" | null>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const { saveReaction, removeReaction, getReaction, isFirebaseConfigured } = useReactions();
  const { toast } = useToast();

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Load user's reaction for this movie
  useEffect(() => {
    const loadReaction = async () => {
      const reaction = await getReaction(movie.id);
      setCurrentReaction(reaction);
    };
    loadReaction();
  }, [movie.id, getReaction]);

  // Show trivia notification when 95% complete
  useEffect(() => {
    if (progress >= 95 && !showTriviaNotification) {
      setShowTriviaNotification(true);
    }
  }, [progress, showTriviaNotification]);

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


  return (
    <div className="relative">
      <Card className="overflow-hidden bg-card">
        <div className="relative aspect-video bg-black">
          {movie.videoUrl ? (
            <EnhancedVideoPlayer
              src={movie.videoUrl}
              poster={movie.posterUrl || undefined}
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

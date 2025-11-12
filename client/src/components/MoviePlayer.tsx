import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Trophy, Film, Bookmark, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(movie.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTriviaNotification, setShowTriviaNotification] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<"like" | "dislike" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0] / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <Card className="overflow-hidden bg-card">
        <div className="relative aspect-video bg-black">
          {movie.videoUrl ? (
            <video
              ref={videoRef}
              src={movie.videoUrl}
              className="h-full w-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              data-testid="video-player"
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

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            <div className="mb-2">
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
                data-testid="slider-timeline"
              />
              <div className="mt-1 flex justify-between text-xs text-white/80">
                <span data-testid="text-current-time">{formatTime(currentTime)}</span>
                <span data-testid="text-duration">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                  data-testid="button-play-pause"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                    data-testid="button-mute"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-24 cursor-pointer"
                    data-testid="slider-volume"
                  />
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
                data-testid="button-fullscreen"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Movie Title & Progress */}
        <div 
          className="p-6 pb-8"
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
          
          {/* Quick Start Trivia Button - for MVP/testing when no video available */}
          {!movie.videoUrl && (
            <button
              onClick={onTriviaReady}
              className="gradient-border-button mt-4 w-full"
              data-testid="button-quick-start-trivia"
            >
              <span className="gradient-border-content px-6 py-3 text-base font-medium">
                <Trophy className="mr-2 h-5 w-5 inline-block" />
                Start Deep Dive Trivia
              </span>
            </button>
          )}
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
            className="px-6 pb-6 pt-2"
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
            
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">Synopsis</h3>
            <p className="text-base leading-relaxed text-muted-foreground">{movie.description}</p>
          </div>
        )}
      </Card>

      {/* Trivia Ready Notification */}
      {showTriviaNotification && (
        <Card 
          className="absolute -bottom-4 right-4 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4"
          style={{
            background: 'linear-gradient(to bottom right, rgba(27, 169, 175, 0.3), rgba(27, 169, 175, 0.1))',
            borderColor: '#1ba9af'
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="rounded-full p-2" 
              style={{ 
                backgroundColor: '#1ba9af',
                boxShadow: '0 0 15px rgba(27, 169, 175, 0.4)'
              }}
            >
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Deep Dive Ready!</h3>
              <p className="text-sm text-muted-foreground">Start your trivia challenge</p>
              <button
                onClick={onTriviaReady}
                className="gradient-border-button mt-2"
                data-testid="button-start-trivia"
              >
                <span className="gradient-border-content px-4 py-1.5 text-sm font-medium">
                  Start Now
                </span>
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

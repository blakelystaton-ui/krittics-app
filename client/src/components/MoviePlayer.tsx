import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Trophy, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { Movie } from "@shared/schema";

interface MoviePlayerProps {
  movie: Movie;
  onTriviaReady: () => void;
}

export function MoviePlayer({ movie, onTriviaReady }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(movie.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTriviaNotification, setShowTriviaNotification] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Show trivia notification when 95% complete
  useEffect(() => {
    if (progress >= 95 && !showTriviaNotification) {
      setShowTriviaNotification(true);
    }
  }, [progress, showTriviaNotification]);

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

        {/* Movie Info */}
        <div className="p-6">
          <h2 className="font-display text-2xl font-bold text-foreground">{movie.title}</h2>
          {movie.description && (
            <p className="mt-2 text-base text-muted-foreground">{movie.description}</p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground" data-testid="text-progress">
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Quick Start Trivia Button - for MVP/testing when no video available */}
          {!movie.videoUrl && (
            <Button
              onClick={onTriviaReady}
              className="mt-4 w-full"
              size="lg"
              data-testid="button-quick-start-trivia"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Start Deep Dive Trivia
            </Button>
          )}
        </div>
      </Card>

      {/* Trivia Ready Notification */}
      {showTriviaNotification && (
        <Card className="absolute -bottom-4 right-4 border-primary bg-primary/10 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary p-2">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Deep Dive Ready!</h3>
              <p className="text-sm text-muted-foreground">Start your trivia challenge</p>
              <Button
                size="sm"
                onClick={onTriviaReady}
                className="mt-2"
                data-testid="button-start-trivia"
              >
                Start Now
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

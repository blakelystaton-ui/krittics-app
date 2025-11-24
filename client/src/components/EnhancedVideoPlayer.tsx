import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Play, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type assertion helper for plugin methods
type PlayerWithPlugins = Player & {
  floatingMode?: {
    enter: () => void;
    exit: () => void;
    isActive: () => boolean;
  };
  floatingPlayer?: (options: any) => void;
};

// Custom plugin for floating/PiP mode
const floatingPlayerPlugin = function(this: Player, options: { onClose?: () => void }) {
  const player = this;
  let floatingContainer: HTMLDivElement | null = null;
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  const createFloatingContainer = () => {
    if (floatingContainer) return floatingContainer;

    floatingContainer = document.createElement('div');
    floatingContainer.className = 'floating-video-player';
    floatingContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      height: 180px;
      z-index: 9999;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      cursor: move;
      touch-action: none;
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'floating-close-btn';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.7);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => {
      exitFloatingMode();
      if (options.onClose) options.onClose();
    };

    floatingContainer.appendChild(closeBtn);
    return floatingContainer;
  };

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    if (!floatingContainer) return;
    
    isDragging = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    initialX = clientX - currentX;
    initialY = clientY - currentY;
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !floatingContainer) return;

    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    currentX = clientX - initialX;
    currentY = clientY - initialY;

    floatingContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
  };

  const handleDragEnd = () => {
    isDragging = false;
  };

  const enterFloatingMode = () => {
    const container = createFloatingContainer();
    const playerEl = player.el();
    
    // Save original parent
    const originalParent = playerEl.parentElement;
    if (originalParent) {
      (playerEl as any)._originalParent = originalParent;
    }

    // Move player to floating container
    container.appendChild(playerEl);
    document.body.appendChild(container);

    // Add drag listeners
    container.addEventListener('mousedown', handleDragStart as EventListener);
    container.addEventListener('touchstart', handleDragStart as EventListener);
    document.addEventListener('mousemove', handleDrag as EventListener);
    document.addEventListener('touchmove', handleDrag as EventListener);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    player.addClass('vjs-floating');
  };

  const exitFloatingMode = () => {
    if (!floatingContainer) return;

    const playerEl = player.el();
    const originalParent = (playerEl as any)._originalParent;

    // Remove drag listeners
    floatingContainer.removeEventListener('mousedown', handleDragStart as EventListener);
    floatingContainer.removeEventListener('touchstart', handleDragStart as EventListener);
    document.removeEventListener('mousemove', handleDrag as EventListener);
    document.removeEventListener('touchmove', handleDrag as EventListener);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);

    // Return player to original position
    if (originalParent) {
      originalParent.appendChild(playerEl);
    }

    // Remove floating container
    floatingContainer.remove();
    floatingContainer = null;
    currentX = 0;
    currentY = 0;

    player.removeClass('vjs-floating');
  };

  (player as any).floatingMode = {
    enter: enterFloatingMode,
    exit: exitFloatingMode,
    isActive: () => !!floatingContainer
  };
};

// Register the plugin
videojs.registerPlugin('floatingPlayer', floatingPlayerPlugin);

interface EnhancedVideoPlayerProps {
  src: string;
  poster?: string;
  movieId?: string; // For progress tracking
  autoplay?: boolean; // Enable autoplay
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export const EnhancedVideoPlayer = forwardRef<VideoPlayerHandle, EnhancedVideoPlayerProps>(({
  src,
  poster,
  movieId,
  autoplay = false,
  onTimeUpdate,
  onEnded,
  className = ''
}, ref) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const lastSavedProgressRef = useRef<number>(0); // Track last saved progress to avoid redundant saves
  const { toast } = useToast();
  
  // Use refs to store callbacks to prevent player reinitialization when props change
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndedRef = useRef(onEnded);

  // Fetch user info to check if authenticated
  const { data: user } = useQuery<{ id: string } | null>({
    queryKey: ['/api/auth/user'],
  });

  // Load initial progress if authenticated and movieId provided
  const { data: initialProgress } = useQuery<{ progressSeconds: number; completed: boolean } | null>({
    queryKey: ['/api/progress', movieId],
    enabled: !!movieId && !!user,
  });

  // Mutation to save progress
  const saveProgressMutation = useMutation({
    mutationFn: async ({ progressSeconds, completed }: { progressSeconds: number; completed: boolean }) => {
      if (!movieId) return;
      await apiRequest('POST', `/api/progress/${movieId}`, { progressSeconds, completed });
    },
    onSuccess: () => {
      // Invalidate BOTH the continue-watching cache AND the specific progress query
      // This ensures the "Continue Watching" buttons reappear after progress is saved
      queryClient.invalidateQueries({ queryKey: ['/api/continue-watching'] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress', movieId] });
    },
  });

  // Update refs when props change (without triggering reinitialization)
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  
  // Reset states when autoplay prop changes
  useEffect(() => {
    setAutoplayBlocked(false);
    setPlaybackError(null);
  }, [autoplay]);

  useEffect(() => {
    if (!videoRef.current) return;

    // Debug logging
    console.log('🎬 Initializing video player with source:', src);

    // Initialize Video.js player
    const videoElement = document.createElement('video-js');
    videoElement.className = 'vjs-big-play-centered';
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      preload: 'auto',
      autoplay: autoplay, // Use Video.js native autoplay with browser policy negotiation
      muted: autoplay, // Mute when autoplaying to comply with browser policies
      poster: poster,
      sources: [{
        src: src,
        type: 'video/mp4'
      }],
      controlBar: {
        pictureInPictureToggle: false // We'll use custom floating mode
      }
    });
    
    // Debug: Log player errors
    player.on('error', () => {
      const error = player.error();
      console.error('❌ Video.js error:', error?.code, error?.message, 'Source:', src);
      
      // Set playback error for user-facing feedback
      if (error?.code === 4) {
        setPlaybackError('Unable to load video. The source may not be available.');
      } else {
        setPlaybackError(`Playback error (code ${error?.code})`);
      }
      
      // Don't hide overlay - let user see the error state
    });

    playerRef.current = player;
    const playerWithPlugins = player as PlayerWithPlugins;
    
    // Detect autoplay blocks and provide fallback
    if (autoplay) {
      player.ready(() => {
        // Video.js will attempt autoplay internally
        let hasStartedPlaying = false;
        
        const handlePlaying = () => {
          // Only hide overlay when video is actually playing
          hasStartedPlaying = true;
          console.log('✅ Video is now playing');
          setAutoplayBlocked(false);
        };
        
        const handleSuspend = () => {
          // If suspended without playing, autoplay likely blocked
          if (!hasStartedPlaying && player.paused()) {
            console.warn('⚠️ Autoplay appears to be blocked');
            setAutoplayBlocked(true);
          }
        };
        
        // Listen for 'playing' event (not just 'play') to confirm playback started
        player.on('playing', handlePlaying);
        player.one('suspend', handleSuspend);
        
        // Check after a short delay if autoplay worked
        setTimeout(() => {
          if (!hasStartedPlaying && player.paused()) {
            console.warn('⚠️ Autoplay was blocked by browser');
            setAutoplayBlocked(true);
          }
        }, 500);
      });
    }


    // Initialize floating player plugin
    if (playerWithPlugins.floatingPlayer) {
      playerWithPlugins.floatingPlayer({
        onClose: () => setIsFloating(false)
      });
    }

    // Time update for progress tracking
    player.on('timeupdate', () => {
      const currentTime = player.currentTime() || 0;
      const duration = player.duration() || 0;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

      // Save progress only if watched at least 15 seconds
      if (movieId && user && currentTime >= 15 && duration > 0) {
        const progressSeconds = Math.floor(currentTime);
        
        // Only save if progress changed by 5+ seconds
        if (Math.abs(progressSeconds - lastSavedProgressRef.current) >= 5) {
          lastSavedProgressRef.current = progressSeconds;
          const completed = progress >= 95;
          saveProgressMutation.mutate({ progressSeconds, completed });
        }
      }

      // Use ref to access current callback
      if (onTimeUpdateRef.current) {
        onTimeUpdateRef.current(currentTime, duration);
      }
    });

    // Handle video end
    player.on('ended', () => {
      // Mark as completed when video ends
      if (movieId && user) {
        const duration = player.duration() || 0;
        saveProgressMutation.mutate({ 
          progressSeconds: Math.floor(duration), 
          completed: true 
        });
      }
      
      // Use ref to access current callback
      if (onEndedRef.current) onEndedRef.current();
    });

    // Cleanup
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
      }
    };
  }, [src, poster]); // Only reinitialize when video source changes

  // DO NOT auto-resume from saved progress
  // Let the parent component (MoviePlayer) show the "Continue Watching" dialog
  // and handle resume logic via the exposed controls

  // Expose player controls to parent component
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.currentTime(seconds);
      }
    },
    play: () => {
      if (playerRef.current) {
        playerRef.current.play();
      }
    },
    pause: () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    },
    getCurrentTime: () => {
      return playerRef.current?.currentTime() || 0;
    },
    getDuration: () => {
      return playerRef.current?.duration() || 0;
    }
  }));

  // Handle floating mode toggle
  const toggleFloatingMode = () => {
    if (!playerRef.current) return;
    const playerWithPlugins = playerRef.current as PlayerWithPlugins;

    if (isFloating && playerWithPlugins.floatingMode) {
      playerWithPlugins.floatingMode.exit();
      setIsFloating(false);
    } else if (playerWithPlugins.floatingMode) {
      playerWithPlugins.floatingMode.enter();
      setIsFloating(true);
    }
  };

  // Handler for manual play button (when autoplay is blocked)
  const handleManualPlay = async () => {
    if (!playerRef.current) return;
    
    try {
      // Unmute for manual playback (user gesture allows audio)
      playerRef.current.muted(false);
      
      await playerRef.current.play();
      console.log('✅ Manual play started');
      // Overlay will be hidden by 'playing' event listener
    } catch (error) {
      console.error('Failed to play video:', error);
      
      // Show error toast for user feedback
      toast({
        title: "Playback Failed",
        description: error instanceof Error ? error.message : "Unable to start playback. Click to try again.",
        variant: "destructive",
        duration: 3000,
      });
      
      // Keep overlay visible for retry
    }
  };

  return (
    <div className={`enhanced-video-player-wrapper ${className}`} style={{ position: 'relative' }}>
      <div ref={videoRef} data-testid="video-player-enhanced" />

      {/* Autoplay Blocked Fallback Overlay */}
      {autoplayBlocked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-[100] cursor-pointer"
          onClick={handleManualPlay}
          data-testid="overlay-autoplay-blocked"
        >
          {playbackError ? (
            // Show error state
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center shadow-lg shadow-destructive/30">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <p className="mt-4 text-destructive text-base font-semibold max-w-xs text-center px-4">
                {playbackError}
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Click to retry
              </p>
            </>
          ) : (
            // Show play button
            <>
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center transition-transform hover:scale-110 shadow-lg shadow-primary/50">
                <Play className="h-10 w-10 text-primary-foreground" fill="currentColor" />
              </div>
              <p className="mt-4 text-foreground text-base font-semibold">
                Click to Play
              </p>
            </>
          )}
        </div>
      )}

      {/* Floating mode toggle button */}
      {!isFloating && (
        <button
          onClick={toggleFloatingMode}
          className="floating-toggle-btn"
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '10px',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          data-testid="button-toggle-floating"
        >
          Float Player
        </button>
      )}

      <style>{`
        .vjs-floating {
          width: 100% !important;
          height: 100% !important;
        }
        
        .end-credit-banner {
          pointer-events: auto;
        }

        .floating-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .floating-close-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }
      `}</style>
    </div>
  );
});

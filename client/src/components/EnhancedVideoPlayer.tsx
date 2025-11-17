import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-ads';
import 'videojs-ima';
import { AdSense, AdSenseInterstitial } from './AdSense';
import Player from 'video.js/dist/types/player';

// Type assertion helper for plugin methods
type PlayerWithPlugins = Player & {
  floatingMode?: {
    enter: () => void;
    exit: () => void;
    isActive: () => boolean;
  };
  ads?: () => void;
  ima?: (options: any) => void;
  adManagement?: (options: any) => void;
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

// Custom plugin for ad management
const adManagementPlugin = function(this: Player, options: {
  onAdStart?: () => void;
  onAdEnd?: () => void;
  getFullScreenActivated: () => boolean; // Changed to function that reads current state
}) {
  const player = this;
  let isAdPlaying = false;
  let originalFullscreenState = false;
  let fullscreenChangeHandler: (() => void) | null = null;

  const preventFullscreenExit = () => {
    if (isAdPlaying && !player.isFullscreen()) {
      // Force back to fullscreen if user tries to exit during ad
      player.requestFullscreen();
    }
  };

  player.on('adstart', () => {
    isAdPlaying = true;
    
    // Only play ad if fullscreen has been activated at least once
    // NOW reads current state instead of initialization value
    if (!options.getFullScreenActivated()) {
      const playerWithAds = player as any;
      if (playerWithAds.ads && playerWithAds.ads.skipLinearAdMode) {
        playerWithAds.ads.skipLinearAdMode();
      }
      return;
    }

    if (options.onAdStart) options.onAdStart();

    // Force fullscreen when ad starts
    originalFullscreenState = player.isFullscreen() ?? false;
    if (!originalFullscreenState) {
      player.requestFullscreen();
    }

    // Prevent exiting fullscreen during ad
    fullscreenChangeHandler = preventFullscreenExit;
    player.on('fullscreenchange', fullscreenChangeHandler);
  });

  player.on('adend', () => {
    isAdPlaying = false;

    if (options.onAdEnd) options.onAdEnd();

    // Remove fullscreen exit prevention
    if (fullscreenChangeHandler) {
      player.off('fullscreenchange', fullscreenChangeHandler);
      fullscreenChangeHandler = null;
    }

    // Restore original fullscreen state
    if (!originalFullscreenState && player.isFullscreen()) {
      player.exitFullscreen();
    }
  });
};

videojs.registerPlugin('adManagement', adManagementPlugin);

interface EnhancedVideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
  adTagUrl?: string; // VAST ad tag URL
  on50PercentAdShown?: () => void; // Callback when 50% ad is shown
}

export function EnhancedVideoPlayer({
  src,
  poster,
  onTimeUpdate,
  onEnded,
  className = '',
  adTagUrl,
  on50PercentAdShown
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [showEndCreditBanner, setShowEndCreditBanner] = useState(false);
  const [fullScreenActivated, setFullScreenActivated] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [showPreRollAd, setShowPreRollAd] = useState(true); // Show ad immediately on load
  const [show50PercentAd, setShow50PercentAd] = useState(false);
  const [playerElement, setPlayerElement] = useState<HTMLElement | null>(null);
  const has50PercentAdShownRef = useRef(false); // Use ref instead of state to prevent closure issues
  
  // Use refs to store callbacks and state that plugins need to access
  // This prevents player reinitialization when props change
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndedRef = useRef(onEnded);
  const fullScreenActivatedRef = useRef(fullScreenActivated);
  const on50PercentAdShownRef = useRef(on50PercentAdShown);

  // Update refs when props change (without triggering reinitialization)
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    fullScreenActivatedRef.current = fullScreenActivated;
  }, [fullScreenActivated]);

  useEffect(() => {
    on50PercentAdShownRef.current = on50PercentAdShown;
  }, [on50PercentAdShown]);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js player
    const videoElement = document.createElement('video-js');
    videoElement.className = 'vjs-big-play-centered';
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      preload: 'auto',
      poster: poster,
      sources: [{
        src: src,
        type: 'video/mp4'
      }],
      controlBar: {
        pictureInPictureToggle: false // We'll use custom floating mode
      }
    });

    playerRef.current = player;
    const playerWithPlugins = player as PlayerWithPlugins;
    
    // Wait for player to be ready before storing element for portal rendering
    player.ready(() => {
      setPlayerElement(player.el() as HTMLElement);
    });

    // Initialize ad plugin if adTagUrl provided
    if (adTagUrl) {
      if (playerWithPlugins.ads) playerWithPlugins.ads();
      
      // Initialize IMA plugin for VAST ads
      if (playerWithPlugins.ima) {
        playerWithPlugins.ima({
          adTagUrl: adTagUrl,
          adsRenderingSettings: {
            enablePreloading: true
          }
        });
      }

      // Initialize custom ad management
      if (playerWithPlugins.adManagement) {
        playerWithPlugins.adManagement({
          getFullScreenActivated: () => fullScreenActivatedRef.current, // Use ref getter
          onAdStart: () => console.log('Ad started'),
          onAdEnd: () => console.log('Ad ended')
        });
      }
    }

    // Initialize floating player plugin
    if (playerWithPlugins.floatingPlayer) {
      playerWithPlugins.floatingPlayer({
        onClose: () => setIsFloating(false)
      });
    }

    // Track fullscreen activation
    player.on('fullscreenchange', () => {
      if (player.isFullscreen() && !fullScreenActivatedRef.current) {
        setFullScreenActivated(true); // This updates state AND ref
        console.log('Full-screen activated for the first time - ads now enabled');
      }
    });

    // Time update for end-credit banner (last 2 minutes) and 50% ad
    player.on('timeupdate', () => {
      const currentTime = player.currentTime() || 0;
      const duration = player.duration() || 0;
      const remainingTime = duration - currentTime;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

      // Show banner in last 2 minutes (120 seconds)
      setShowEndCreditBanner(remainingTime <= 120 && remainingTime > 0);

      // Trigger 50% interstitial ad (use ref to avoid stale closure)
      if (progress >= 50 && !has50PercentAdShownRef.current) {
        console.log('50% progress reached - showing interstitial ad inside player');
        setShow50PercentAd(true);
        has50PercentAdShownRef.current = true; // Set ref immediately
        if (on50PercentAdShownRef.current) {
          on50PercentAdShownRef.current();
        }
      }

      // Use ref to access current callback
      if (onTimeUpdateRef.current) {
        onTimeUpdateRef.current(currentTime, duration);
      }
    });

    // Handle video end
    player.on('ended', () => {
      // Use ref to access current callback
      if (onEndedRef.current) onEndedRef.current();
    });

    // Cleanup
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
      }
      // Reset ad state on cleanup
      setShowPreRollAd(true); // Reset to show pre-roll on next load
      setShow50PercentAd(false);
      has50PercentAdShownRef.current = false;
      setPlayerElement(null);
    };
  }, [src, poster, adTagUrl]); // Only reinitialize when video source or ad tag changes

  // Fail-safe: Auto-dismiss 50% ad after 6 seconds
  useEffect(() => {
    if (!show50PercentAd) return;
    
    const failsafeTimer = setTimeout(() => {
      setShow50PercentAd(false);
    }, 6000);
    
    return () => clearTimeout(failsafeTimer);
  }, [show50PercentAd]);

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

  return (
    <div className={`enhanced-video-player-wrapper ${className}`}>
      <div ref={videoRef} data-testid="video-player-enhanced" />
      
      {/* End-credit banner ad (last 2 minutes) */}
      {showEndCreditBanner && (
        <div className="end-credit-banner" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '8px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <AdSense 
            adSlot="5966285343"
            adFormat="auto"
            fullWidth={false}
          />
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

      {/* Pre-roll ad - shows immediately when player loads */}
      {showPreRollAd && playerElement && createPortal(
        <AdSenseInterstitial
          adSlot="5966285343"
          onClose={() => {
            setShowPreRollAd(false);
            // Auto-play video after ad is dismissed
            if (playerRef.current && !playerRef.current.isDisposed()) {
              playerRef.current.play();
            }
          }}
          inline={true}
        />,
        playerElement
      )}

      {/* 50% interstitial ad - rendered inside player using portal for fullscreen compatibility */}
      {show50PercentAd && playerElement && createPortal(
        <AdSenseInterstitial
          adSlot="5966285343"
          onClose={() => setShow50PercentAd(false)}
          inline={true}
        />,
        playerElement
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
}

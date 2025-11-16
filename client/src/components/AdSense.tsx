import { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
  className?: string;
  fullWidth?: boolean;
}

export function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  style = {},
  className = '',
  fullWidth = true 
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2630873967811499"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth.toString()}
      />
    </div>
  );
}

// Full-screen interstitial ad (shows before Krossfire)
export function AdSenseInterstitial({ 
  adSlot,
  onClose 
}: { 
  adSlot: string;
  onClose: () => void | Promise<void>;
}) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }

    // Listen for AdSense lifecycle events from Google's iframe
    const handleAdLifecycle = (event: MessageEvent) => {
      // Filter by Google origins for security
      const origin = event.origin;
      if (!origin.endsWith('google.com') && !origin.endsWith('doubleclick.net')) {
        return;
      }

      // Check for AdSense interstitial dismissal events
      const messageType = event.data?.messageType;
      if (
        messageType === 'adsbygoogle-interstitial-dismissed' ||
        messageType === 'adsbygoogle-rewarded-dismissed' ||
        messageType === 'adsbygoogle-interstitial-closed'
      ) {
        console.log('AdSense lifecycle event:', messageType);
        onClose();
      }
    };

    // Register message listener for AdSense lifecycle events
    window.addEventListener('message', handleAdLifecycle);

    // Fail-safe: Auto-close after 6 seconds if no lifecycle event fires
    const timer = setTimeout(onClose, 6000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleAdLifecycle);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl p-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 px-3 py-1 text-sm text-muted-foreground hover-elevate"
          data-testid="button-close-ad"
        >
          Skip Ad
        </button>
        
        <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-card p-8">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '250px' }}
            data-ad-client="ca-pub-2630873967811499"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}

// TypeScript declaration for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

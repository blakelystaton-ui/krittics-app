import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Movie } from '@shared/schema';

// Generate vibrant dominant color for each movie based on ID
function getMovieDominantColor(movieId: string): { hex: string; rgb: string; hsl: string } {
  // Hash the movie ID to get consistent colors
  let hash = 0;
  for (let i = 0; i < movieId.length; i++) {
    hash = movieId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate vibrant, saturated colors with good brightness
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash >> 8) % 25); // 65-90%
  const lightness = 50 + (Math.abs(hash >> 16) % 15); // 50-65%
  
  // Convert HSL to RGB for various uses
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    rgb: `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`,
    hsl: `${hue}, ${saturation}%, ${lightness}%`
  };
}

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  showProgress?: boolean;
  progress?: number;
}

function MovieCard({ movie, onClick, showProgress, progress = 0 }: MovieCardProps) {
  const dominantColor = getMovieDominantColor(movie.id);
  
  return (
    <div 
      className="group relative flex-shrink-0 w-[280px] cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
      onClick={onClick}
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
        {movie.posterUrl ? (
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Play className="h-16 w-16 text-primary opacity-40" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="icon" variant="default" className="rounded-full" data-testid="button-play-quick">
            <Play className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full" data-testid="button-add-list">
            <Plus className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full" data-testid="button-info">
            <Info className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Progress bar for Continue Watching */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
            <div 
              className="h-full transition-all" 
              style={{ 
                width: `${progress}%`,
                backgroundColor: dominantColor.hex
              }}
            />
          </div>
        )}
      </div>
      
      {/* Title always visible with white color */}
      <div className="mt-3">
        <h4 
          className="font-semibold text-sm truncate line-clamp-1 text-white"
        >
          {movie.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {movie.year && <span className="text-xs text-muted-foreground">{movie.year}</span>}
          {movie.genre && <Badge variant="outline" className="text-xs">{movie.genre}</Badge>}
        </div>
      </div>
    </div>
  );
}

interface ContentRowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  showProgress?: boolean;
}

function ContentRow({ title, movies, onMovieClick, showProgress }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  if (movies.length === 0) return null;

  return (
    <div 
      className="relative group/row mb-12 py-6 rounded-lg" 
      data-testid={`content-row-${title.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%), linear-gradient(135deg, rgba(21, 212, 220, 0.25) 0%, rgba(27, 169, 175, 0.3) 25%, rgba(14, 138, 143, 0.2) 50%, rgba(27, 169, 175, 0.25) 75%, rgba(21, 212, 220, 0.2) 100%)'
      }}
    >
      <h2 className="font-display text-2xl font-bold text-foreground mb-4 px-4 md:px-12">{title}</h2>
      
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-[50%] z-20 h-32 w-12 -translate-y-1/2 bg-black/80 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/90"
          data-testid="button-scroll-left"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-[50%] z-20 h-32 w-12 -translate-y-1/2 bg-black/80 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/90"
          data-testid="button-scroll-right"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}
      
      {/* Movie cards */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide touch-scroll px-4 md:px-12 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={() => onMovieClick(movie)}
            showProgress={showProgress}
            progress={showProgress ? (index % 4) * 25 + 15 : 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [, setLocation] = useLocation();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Fetch movies from API
  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });

  // Hero carousel rotation - randomly select 5 movies each time the app loads
  const featuredMovies = useMemo(() => {
    if (movies.length === 0) return [];
    // Fisher-Yates shuffle for unbiased random selection
    const shuffled = [...movies];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Take the first 5 from the shuffled array
    return shuffled.slice(0, Math.min(5, shuffled.length));
  }, [movies]);
  
  // Reset hero index when featured movies change to prevent out-of-bounds
  useEffect(() => {
    setCurrentHeroIndex(0);
  }, [featuredMovies]);
  
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentHero = featuredMovies[currentHeroIndex];
  const heroDominantColor = currentHero ? getMovieDominantColor(currentHero.id) : null;

  const handleMovieClick = (movie: Movie) => {
    setLocation(`/player?movieId=${movie.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden touch-scroll" data-testid="page-browse">
      {/* Hero Carousel Banner */}
      {currentHero && heroDominantColor && (
        <div 
          className="relative h-[70vh] md:h-[85vh] mb-8"
          style={{
            '--hero-color-rgb': heroDominantColor.rgb,
            '--hero-color-hex': heroDominantColor.hex
          } as React.CSSProperties}
        >
          {/* Background Image with Dynamic Color Gradient Overlay */}
          <div className="absolute inset-0">
            {currentHero.posterUrl ? (
              <img 
                src={currentHero.posterUrl} 
                alt={currentHero.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div 
                className="h-full w-full bg-gradient-to-br"
                style={{
                  background: `linear-gradient(135deg, rgba(${heroDominantColor.rgb}, 0.3) 0%, rgba(${heroDominantColor.rgb}, 0.1) 50%, hsl(var(--background)) 100%)`
                }}
              />
            )}
            {/* Dynamic themed gradient overlays for readability */}
            <div 
              className="absolute inset-0 hero-gradient-overlay"
              style={{
                background: `linear-gradient(to top, hsl(var(--background)) 0%, rgba(${heroDominantColor.rgb}, 0.4) 50%, transparent 100%)`
              }}
            />
            <div 
              className="absolute inset-0 hero-gradient-overlay"
              style={{
                background: `linear-gradient(to right, hsl(var(--background)) 0%, rgba(${heroDominantColor.rgb}, 0.3) 40%, transparent 100%)`
              }}
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex h-full items-end pb-20 md:pb-32">
            <div className="container mx-auto px-4 md:px-12">
              <div className="max-w-2xl">
                <h1 
                  className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 hero-themed"
                  style={{
                    color: 'hsl(var(--foreground))',
                    textShadow: `0 0 40px rgba(${heroDominantColor.rgb}, 0.6), 0 0 80px rgba(${heroDominantColor.rgb}, 0.4), 0 4px 20px rgba(0, 0, 0, 0.8)`
                  }}
                >
                  {currentHero.title}
                </h1>
                <p className="text-base md:text-lg text-foreground/90 mb-6 line-clamp-3 drop-shadow-lg">
                  {currentHero.description}
                </p>
                
                <div className="flex items-center gap-3 mb-6">
                  {currentHero.year && <span className="text-sm font-medium text-foreground/80">{currentHero.year}</span>}
                  {currentHero.genre && (
                    <Badge 
                      variant="secondary"
                      className="hero-themed"
                      style={{
                        backgroundColor: `rgba(${heroDominantColor.rgb}, 0.2)`,
                        borderColor: `rgba(${heroDominantColor.rgb}, 0.4)`,
                        color: heroDominantColor.hex
                      }}
                    >
                      {currentHero.genre}
                    </Badge>
                  )}
                  {currentHero.rating && <Badge variant="outline">{currentHero.rating}</Badge>}
                </div>

                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="gap-2 px-8 hero-themed border"
                    style={{
                      backgroundColor: heroDominantColor.hex,
                      borderColor: heroDominantColor.hex,
                      color: 'white'
                    }}
                    onClick={() => handleMovieClick(currentHero)}
                    data-testid="button-hero-play"
                  >
                    <Play className="h-5 w-5" />
                    Play Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="gap-2 px-8 backdrop-blur-md hero-themed"
                    style={{
                      backgroundColor: `rgba(${heroDominantColor.rgb}, 0.15)`,
                      borderColor: `rgba(${heroDominantColor.rgb}, 0.3)`,
                      color: 'hsl(var(--foreground))'
                    }}
                    onClick={() => handleMovieClick(currentHero)}
                    data-testid="button-hero-info"
                  >
                    <Info className="h-5 w-5" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 pt-8">
        {/* First row with carousel indicators aligned */}
        <div 
          className="relative group/row mb-12 py-6 rounded-lg" 
          data-testid="content-row-continue-watching"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%), linear-gradient(135deg, rgba(21, 212, 220, 0.25) 0%, rgba(27, 169, 175, 0.3) 25%, rgba(14, 138, 143, 0.2) 50%, rgba(27, 169, 175, 0.25) 75%, rgba(21, 212, 220, 0.2) 100%)'
          }}
        >
          <div className="flex items-center justify-between px-4 md:px-12 mb-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Continue Watching</h2>
            
            {/* Carousel indicators aligned on the right */}
            {currentHero && heroDominantColor && (
              <div className="flex gap-2">
                {featuredMovies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className="h-1 transition-all duration-300"
                    style={{
                      width: index === currentHeroIndex ? '32px' : '24px',
                      backgroundColor: index === currentHeroIndex 
                        ? heroDominantColor.hex 
                        : `rgba(${heroDominantColor.rgb}, 0.4)`
                    }}
                    data-testid={`hero-indicator-${index}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Movie cards for Continue Watching */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide touch-scroll px-4 md:px-12 pb-4">
            {movies.slice(0, 8).map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => handleMovieClick(movie)}
                showProgress={true}
                progress={(index % 4) * 25 + 15}
              />
            ))}
          </div>
        </div>
        
        <ContentRow 
          title="Trending Now" 
          movies={movies.slice(3, 11)} 
          onMovieClick={handleMovieClick}
        />
        
        <ContentRow 
          title="New Releases" 
          movies={movies.slice(5, 13)} 
          onMovieClick={handleMovieClick}
        />
        
        <ContentRow 
          title="Top Rated" 
          movies={movies.slice(2, 10)} 
          onMovieClick={handleMovieClick}
        />
        
        <ContentRow 
          title="Action & Adventure" 
          movies={movies.filter(m => m.genre === 'Action' || m.genre === 'Adventure')} 
          onMovieClick={handleMovieClick}
        />
        
        <ContentRow 
          title="Drama & Thriller" 
          movies={movies.filter(m => m.genre === 'Drama' || m.genre === 'Thriller')} 
          onMovieClick={handleMovieClick}
        />
        
        <ContentRow 
          title="Sci-Fi & Fantasy" 
          movies={movies.filter(m => m.genre === 'Sci-Fi' || m.genre === 'Fantasy')} 
          onMovieClick={handleMovieClick}
        />
        
        <ContentRow 
          title="Comedy & Romance" 
          movies={movies.filter(m => m.genre === 'Comedy' || m.genre === 'Romance')} 
          onMovieClick={handleMovieClick}
        />
      </div>

      {/* Bottom padding */}
      <div className="h-20" />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Movie } from '@shared/schema';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  showProgress?: boolean;
  progress?: number;
}

function MovieCard({ movie, onClick, showProgress, progress = 0 }: MovieCardProps) {
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
              className="h-full bg-primary transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      {/* Title on hover */}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h4 className="font-semibold text-sm text-foreground truncate">{movie.title}</h4>
        <div className="flex items-center gap-2 mt-1">
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
    <div className="relative group/row mb-12" data-testid={`content-row-${title.toLowerCase().replace(/\s+/g, '-')}`}>
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
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
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

  // Hero carousel rotation
  const featuredMovies = movies.slice(0, 5);
  
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentHero = featuredMovies[currentHeroIndex];

  const handleMovieClick = (movie: Movie) => {
    setLocation(`/?movieId=${movie.id}`);
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
    <div className="min-h-screen bg-background overflow-x-hidden" data-testid="page-browse">
      {/* Hero Carousel Banner */}
      {currentHero && (
        <div className="relative h-[70vh] md:h-[85vh] mb-8">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0">
            {currentHero.posterUrl ? (
              <img 
                src={currentHero.posterUrl} 
                alt={currentHero.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
            )}
            {/* Gradient overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex h-full items-end pb-20 md:pb-32">
            <div className="container mx-auto px-4 md:px-12">
              <div className="max-w-2xl">
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-4 drop-shadow-2xl">
                  {currentHero.title}
                </h1>
                <p className="text-base md:text-lg text-foreground/90 mb-6 line-clamp-3 drop-shadow-lg">
                  {currentHero.description}
                </p>
                
                <div className="flex items-center gap-3 mb-6">
                  {currentHero.year && <span className="text-sm font-medium text-foreground/80">{currentHero.year}</span>}
                  {currentHero.genre && <Badge variant="secondary">{currentHero.genre}</Badge>}
                  {currentHero.rating && <Badge variant="outline">{currentHero.rating}</Badge>}
                </div>

                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="gap-2 px-8"
                    onClick={() => handleMovieClick(currentHero)}
                    data-testid="button-hero-play"
                  >
                    <Play className="h-5 w-5" />
                    Play Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="gap-2 px-8 backdrop-blur-md bg-background/20 hover:bg-background/30"
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

          {/* Carousel indicators */}
          <div className="absolute bottom-8 right-4 md:right-12 z-20 flex gap-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`h-1 transition-all duration-300 ${
                  index === currentHeroIndex ? 'w-8 bg-foreground' : 'w-6 bg-foreground/40 hover:bg-foreground/60'
                }`}
                data-testid={`hero-indicator-${index}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 -mt-32 md:-mt-40">
        <ContentRow 
          title="Continue Watching" 
          movies={movies.slice(0, 8)} 
          onMovieClick={handleMovieClick}
          showProgress={true}
        />
        
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

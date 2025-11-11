import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Play, Info, Plus, Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Movie } from '@shared/schema';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

function MovieCard({ movie, onClick, onRemove }: MovieCardProps) {
  return (
    <div 
      className="group flex gap-6 cursor-pointer transition-all duration-300 hover-elevate p-4 rounded-lg"
      onClick={onClick}
      data-testid={`queue-movie-card-${movie.id}`}
    >
      {/* Movie Poster - Left Side */}
      <div className="relative flex-shrink-0 w-[280px]">
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
            <Button 
              size="icon" 
              variant="default" 
              className="rounded-full" 
              data-testid="button-play-queue"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Play className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="destructive" 
              className="rounded-full" 
              data-testid="button-remove-queue"
              onClick={onRemove}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Movie Info - Right Side */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 mb-4">
          {movie.year && <span className="text-sm text-muted-foreground">{movie.year}</span>}
          {movie.genre && <Badge variant="outline" className="text-sm">{movie.genre}</Badge>}
          {movie.rating && <Badge variant="secondary">{movie.rating}</Badge>}
        </div>
        
        {/* Remove from Queue Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-fit mb-4 teal-gradient-bg border-0 text-foreground hover:opacity-90"
          onClick={onRemove}
          data-testid="button-remove-from-queue"
        >
          <X className="h-4 w-4 mr-2" />
          Remove from Queue
        </Button>
        
        <p className="text-base text-muted-foreground line-clamp-3">
          {movie.description || "No synopsis available for this movie."}
        </p>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch user's watchlist
  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/watchlist'],
  });

  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async (movieId: string) => {
      return await apiRequest('DELETE', `/api/watchlist/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Removed from Queue",
        description: "Movie has been removed from your queue",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove movie from queue",
        variant: "destructive",
      });
    },
  });

  const handleMovieClick = (movie: Movie) => {
    setLocation(`/player?movieId=${movie.id}`);
  };

  const handleRemove = (movieId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist.mutate(movieId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-queue">
      {/* Hero Section */}
      <div 
        className="relative py-16 px-4 md:px-12 mb-8"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%), linear-gradient(135deg, rgba(21, 212, 220, 0.3) 0%, rgba(27, 169, 175, 0.35) 25%, rgba(14, 138, 143, 0.25) 50%, rgba(27, 169, 175, 0.3) 75%, rgba(21, 212, 220, 0.25) 100%)'
        }}
      >
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Bookmark className="h-12 w-12 teal-icon-glow" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              My Queue
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your personal collection of movies to watch. Add films you want to see and come back anytime.
          </p>
        </div>
      </div>

      {/* Queue Content */}
      <div className="container mx-auto px-4 md:px-12 pb-12">
        {movies.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Queue is Empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding movies you want to watch to build your personal queue
            </p>
            <Button onClick={() => setLocation('/')} data-testid="button-browse-movies">
              <Play className="h-4 w-4 mr-2" />
              Browse Movies
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => handleMovieClick(movie)}
                onRemove={handleRemove(movie.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

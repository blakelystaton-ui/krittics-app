import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MoviePlayer } from "@/components/MoviePlayer";
import { DeepDiveTrivia } from "@/components/DeepDiveTrivia";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Movie, GeneratedTriviaQuestion } from "@shared/schema";

export default function HomePage() {
  const [location] = useLocation();
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<GeneratedTriviaQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get movieId from URL params (use window.location.search for query params)
  const params = new URLSearchParams(window.location.search);
  const movieIdParam = params.get('movieId');

  // Fetch movies from API
  const { data: movies, isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  // Fetch user's watchlist
  const { data: watchlistMovies = [] } = useQuery<Movie[]>({
    queryKey: ['/api/watchlist'],
  });

  // Create a Set of movie IDs in the watchlist for quick lookup
  const queueMovieIds = useMemo(() => {
    return new Set(watchlistMovies.map(m => m.id));
  }, [watchlistMovies]);

  // Add/Remove from watchlist mutation with optimistic updates
  const toggleWatchlist = useMutation({
    mutationFn: async ({ movieId, inQueue }: { movieId: string; inQueue: boolean }) => {
      if (inQueue) {
        return await apiRequest('DELETE', `/api/watchlist/${movieId}`);
      } else {
        return await apiRequest('POST', `/api/watchlist/${movieId}`);
      }
    },
    onMutate: async ({ movieId, inQueue }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/watchlist'] });
      const previousWatchlist = queryClient.getQueryData<Movie[]>(['/api/watchlist']);
      
      queryClient.setQueryData<Movie[]>(['/api/watchlist'], (old = []) => {
        if (inQueue) {
          return old.filter(movie => movie.id !== movieId);
        } else {
          const movieToAdd = movies?.find(m => m.id === movieId);
          if (movieToAdd && !old.some(m => m.id === movieId)) {
            return [...old, movieToAdd];
          }
          return old;
        }
      });
      
      toast({
        title: inQueue ? "Removed from Queue" : "Added to Queue",
        description: inQueue ? "Movie has been removed from your queue" : "Movie has been added to your queue",
        duration: 1000,
      });
      
      return { previousWatchlist };
    },
    onError: (err, variables, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(['/api/watchlist'], context.previousWatchlist);
      }
      toast({
        title: "Error",
        description: "Failed to update queue. Changes have been reverted.",
        variant: "destructive",
        duration: 1000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
  });

  // Select movie based on URL param or prioritize "The Grand Adventure of Elias"
  let selectedMovie: Movie | undefined;
  
  if (movieIdParam && movies) {
    selectedMovie = movies.find((m) => m.id === movieIdParam);
  }
  
  // Prioritize "The Grand Adventure of Elias" (has real video for testing)
  if (!selectedMovie && movies && movies.length > 0) {
    const elias = movies.find((m) => m.id === '46541562-37bd-42d6-a31c-d58960a5b962');
    selectedMovie = elias || movies[0];
  }
  
  if (!selectedMovie) {
    selectedMovie = {
      id: "1",
      title: "The Grand Adventure of Elias",
      description: "An epic journey through magical lands filled with wonder, danger, and self-discovery.",
      tagline: null,
      director: null,
      cast: null,
      duration: 7200,
      genre: null,
      year: null,
      rating: null,
      posterUrl: null,
      videoUrl: null,
      studio: null,
      country: null,
      language: null,
      awards: null,
    };
  }

  // Reset trivia when movie changes
  useEffect(() => {
    setShowTrivia(false);
    setTriviaQuestions([]);
    setError(null);
  }, [movieIdParam]);

  const handleTriviaReady = () => {
    setShowTrivia(true);
    // Auto-generate trivia when user clicks "Start Now"
    if (triviaQuestions.length === 0) {
      handleGenerateTrivia();
    }
  };

  const handleGenerateTrivia = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiRequest(
        "POST",
        "/api/trivia/generate",
        { movieTitle: selectedMovie.title }
      );
      const data = await response.json() as { questions: GeneratedTriviaQuestion[] };
      setTriviaQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestartTrivia = () => {
    // Keep showTrivia true so we stay in trivia mode
    // Just reset the questions to trigger initial state in DeepDiveTrivia
    setTriviaQuestions([]);
    setError(null);
  };

  const handleToggleQueue = () => {
    if (selectedMovie) {
      const inQueue = queueMovieIds.has(selectedMovie.id);
      toggleWatchlist.mutate({ movieId: selectedMovie.id, inQueue });
    }
  };

  if (moviesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" data-testid="page-home">
        {!showTrivia ? (
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 font-display text-3xl font-bold text-foreground">
              Now Playing
            </h2>
            <MoviePlayer 
              movie={selectedMovie} 
              onTriviaReady={handleTriviaReady}
              inQueue={queueMovieIds.has(selectedMovie.id)}
              onToggleQueue={handleToggleQueue}
            />
          </div>
        ) : (
          <div className="py-8">
            <DeepDiveTrivia
              movieTitle={selectedMovie.title}
              questions={triviaQuestions}
              isGenerating={isGenerating}
              error={error}
              onGenerate={handleGenerateTrivia}
              onRestart={handleRestartTrivia}
            />
          </div>
        )}
      </div>
    </div>
  );
}

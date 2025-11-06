import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MoviePlayer } from "@/components/MoviePlayer";
import { DeepDiveTrivia } from "@/components/DeepDiveTrivia";
import { apiRequest } from "@/lib/queryClient";
import type { Movie, GeneratedTriviaQuestion } from "@shared/schema";

export default function HomePage() {
  const [location] = useLocation();
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<GeneratedTriviaQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get movieId from URL params (use window.location.search for query params)
  const params = new URLSearchParams(window.location.search);
  const movieIdParam = params.get('movieId');

  // Fetch movies from API
  const { data: movies, isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  // Select movie based on URL param or use first movie
  let selectedMovie: Movie | undefined;
  
  if (movieIdParam && movies) {
    selectedMovie = movies.find((m) => m.id === movieIdParam);
  }
  
  if (!selectedMovie && movies && movies.length > 0) {
    selectedMovie = movies[0];
  }
  
  if (!selectedMovie) {
    selectedMovie = {
      id: "1",
      title: "The Grand Adventure of Elias",
      description: "An epic journey through magical lands filled with wonder, danger, and self-discovery.",
      duration: 7200,
      genre: null,
      year: null,
      rating: null,
      posterUrl: null,
      videoUrl: null,
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
    setShowTrivia(false);
    setTriviaQuestions([]);
    setError(null);
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
            <MoviePlayer movie={selectedMovie} onTriviaReady={handleTriviaReady} />
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

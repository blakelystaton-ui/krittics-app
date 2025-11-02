import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoviePlayer } from "@/components/MoviePlayer";
import { DeepDiveTrivia } from "@/components/DeepDiveTrivia";
import { apiRequest } from "@/lib/queryClient";
import type { Movie, GeneratedTriviaQuestion } from "@shared/schema";

export default function HomePage() {
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<GeneratedTriviaQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies from API
  const { data: movies, isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  // Use the first movie (or default if loading)
  const movie: Movie = movies?.[0] || {
    id: "1",
    title: "The Grand Adventure of Elias",
    description: "An epic journey through magical lands filled with wonder, danger, and self-discovery.",
    duration: 7200,
    posterUrl: null,
    videoUrl: null,
  };

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
        { movieTitle: movie.title }
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
      <div className="container mx-auto px-4 py-8">
        {!showTrivia ? (
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 font-display text-3xl font-bold text-foreground">
              Now Playing
            </h2>
            <MoviePlayer movie={movie} onTriviaReady={handleTriviaReady} />
          </div>
        ) : (
          <div className="py-8">
            <DeepDiveTrivia
              movieTitle={movie.title}
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

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Film, Clock, Calendar, Star, Bookmark, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Movie } from "@shared/schema";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MovieLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const { toast } = useToast();

  // Build query params
  const params = new URLSearchParams();
  if (searchQuery) params.append("q", searchQuery);
  if (genreFilter) params.append("genre", genreFilter);
  if (yearFilter) params.append("year", yearFilter);
  if (ratingFilter) params.append("rating", ratingFilter);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/api/movies/search?${queryString}`
    : "/api/movies";

  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: [endpoint],
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/watchlist'] });
      
      // Snapshot the previous value
      const previousWatchlist = queryClient.getQueryData<Movie[]>(['/api/watchlist']);
      
      // Optimistically update to the new value
      queryClient.setQueryData<Movie[]>(['/api/watchlist'], (old = []) => {
        if (inQueue) {
          // Remove from queue
          return old.filter(movie => movie.id !== movieId);
        } else {
          // Add to queue - find the movie from the movies list
          const movieToAdd = movies?.find(m => m.id === movieId);
          if (movieToAdd && !old.some(m => m.id === movieId)) {
            return [...old, movieToAdd];
          }
          return old;
        }
      });
      
      // Show toast immediately
      toast({
        title: inQueue ? "Removed from Queue" : "Added to Queue",
        description: inQueue ? "Movie has been removed from your queue" : "Movie has been added to your queue",
        duration: 1000,
      });
      
      // Return context with the snapshot
      return { previousWatchlist };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value on error
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
      // Refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
  });

  const handleAddToQueue = (movieId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const inQueue = queueMovieIds.has(movieId);
    toggleWatchlist.mutate({ movieId, inQueue });
  };

  // Extract unique values for filters
  const allMovies = movies || [];
  const genres = Array.from(new Set(allMovies.map((m) => m.genre).filter(Boolean)));
  const years = Array.from(new Set(allMovies.map((m) => m.year).filter(Boolean))).sort(
    (a, b) => (b as number) - (a as number)
  );
  const ratings = Array.from(new Set(allMovies.map((m) => m.rating).filter(Boolean)));

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-foreground">
          Movie Library
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our collection of {allMovies.length} movies
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>

          {/* Genre Filter */}
          <Select value={genreFilter || "all"} onValueChange={(v) => setGenreFilter(v === "all" ? "" : v)}>
            <SelectTrigger data-testid="select-genre">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre as string}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select value={yearFilter || "all"} onValueChange={(v) => setYearFilter(v === "all" ? "" : v)}>
            <SelectTrigger data-testid="select-year">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {(genreFilter || yearFilter || ratingFilter || searchQuery) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                data-testid="clear-search"
              >
                Search: "{searchQuery}" ×
              </Button>
            )}
            {genreFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGenreFilter("")}
                data-testid="clear-genre"
              >
                {genreFilter} ×
              </Button>
            )}
            {yearFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setYearFilter("")}
                data-testid="clear-year"
              >
                {yearFilter} ×
              </Button>
            )}
            {ratingFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRatingFilter("")}
                data-testid="clear-rating"
              >
                {ratingFilter} ×
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Movie Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[2/3] animate-pulse bg-muted" />
              <div className="p-4">
                <div className="h-6 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      ) : allMovies.length === 0 ? (
        <Card className="p-12 text-center">
          <Film className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">
            No movies found
          </h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allMovies.map((movie) => (
            <Link key={movie.id} href={`/?movieId=${movie.id}`}>
              <Card
                className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-movie-${movie.id}`}
              >
                {/* Poster Placeholder */}
                <div className="relative aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="flex h-full items-center justify-center">
                    <Film className="h-16 w-16 text-primary/40" />
                  </div>
                  {movie.rating && (
                    <div className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-1 text-xs font-semibold">
                      {movie.rating}
                    </div>
                  )}
                  
                  {/* Bookmark button - bottom right */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background"
                    onClick={handleAddToQueue(movie.id)}
                    data-testid={`button-bookmark-${movie.id}`}
                  >
                    {queueMovieIds.has(movie.id) ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Movie Info */}
                <div className="p-4">
                  <h3
                    className="line-clamp-2 font-display text-lg font-bold text-foreground"
                    data-testid={`text-title-${movie.id}`}
                  >
                    {movie.title}
                  </h3>
                  
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {movie.description}
                  </p>

                  {/* Metadata */}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {movie.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {movie.year}
                      </div>
                    )}
                    {movie.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(movie.duration)}
                      </div>
                    )}
                  </div>

                  {movie.genre && (
                    <div className="mt-2">
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {movie.genre}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

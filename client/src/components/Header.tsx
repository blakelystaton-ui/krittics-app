import { Link, useLocation } from "wouter";
import { Zap, Tv, LogIn, Info, Bookmark, HelpCircle, Search, Play, Target, BookOpen, Clock, X, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@shared/schema";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<Movie[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('krittics-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('krittics-search-history', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Fetch all movies for search
  const { data: movies = [] } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    enabled: isSearchOpen,
  });

  // Filter movies based on search query
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayName = user 
    ? (user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email || 'User')
    : '';
  
  const initials = user
    ? (user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user.email?.[0]?.toUpperCase() || 'U')
    : 'U';

  const handleMovieClick = (movieId: string) => {
    // Add movie to search history (max 5, newest on top)
    const clickedMovie = movies.find(m => m.id === movieId);
    if (clickedMovie) {
      setSearchHistory(prev => {
        // Remove if already in history
        const filtered = prev.filter(m => m.id !== movieId);
        // Add to top and limit to 5
        return [clickedMovie, ...filtered].slice(0, 5);
      });
    }
    
    setIsSearchOpen(false);
    setSearchQuery("");
    setLocation(`/player?movieId=${movieId}`);
  };

  const handleHistoryClick = (movie: Movie) => {
    // Update history - move clicked movie to top
    setSearchHistory(prev => {
      // Remove if already in history
      const filtered = prev.filter(m => m.id !== movie.id);
      // Add to top and limit to 5
      return [movie, ...filtered].slice(0, 5);
    });
    
    setIsSearchOpen(false);
    setSearchQuery("");
    setLocation(`/player?movieId=${movie.id}`);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('krittics-search-history');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" data-testid="link-home">
          <div className="logo-container cursor-pointer" aria-label="Krittics">
            <div className="logo-text">
              KRITTICS
              <div className="crack"></div>
              <div className="crack"></div>
              <div className="crack"></div>
              <div className="crack"></div>
              <div className="crack"></div>
              <div className="crack"></div>
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 ml-6 mr-6">
          <Link href="/" data-testid="link-browse">
            <button className="gradient-border-button">
              <span className="gradient-border-content">
                <Tv className="h-3.5 w-3.5 mr-1.5" />
                <span>Browse</span>
              </span>
            </button>
          </Link>
          <Link href="/krossfire" data-testid="link-krossfire">
            <button className="gradient-border-button">
              <span className="gradient-border-content">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                <span>Krossfire</span>
              </span>
            </button>
          </Link>
          <Link href="/watchlist" data-testid="link-watchlist">
            <button className="gradient-border-button">
              <span className="gradient-border-content">
                <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                <span>Queue</span>
              </span>
            </button>
          </Link>
          <Link href="/insights" data-testid="link-insights">
            <button className="gradient-border-button">
              <span className="gradient-border-content">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                <span>Insights</span>
              </span>
            </button>
          </Link>
          <Link href="/mission" data-testid="link-mission">
            <button className="gradient-border-button mission-button-attention">
              <span className="gradient-border-content">
                <Target className="h-3.5 w-3.5 mr-1.5" />
                <span>Mission</span>
              </span>
            </button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            data-testid="button-search"
            aria-label="Search movies"
            className="hover-elevate p-2 rounded-md"
          >
            <Search 
              className="h-5 w-5" 
              style={{
                stroke: 'url(#searchGradient)',
                strokeWidth: 2
              }}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1ba9af" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#1ba9af" />
                </linearGradient>
              </defs>
            </svg>
          </button>

          {/* Hamburger Menu Icon */}
          <button 
            data-testid="button-menu"
            aria-label="Menu"
            className="hover-elevate p-2 rounded-md"
          >
            <Menu 
              className="h-5 w-5" 
              style={{
                stroke: 'url(#menuGradient)',
                strokeWidth: 2
              }}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="menuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1ba9af" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#1ba9af" />
                </linearGradient>
              </defs>
            </svg>
          </button>

          {!isLoading && !isAuthenticated && (
            <button 
              className="gradient-border-button"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-sign-in"
            >
              <span className="gradient-border-content">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                <span>Sign In</span>
              </span>
            </button>
          )}

          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-2 rounded-full hover-elevate"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.profileImageUrl || undefined} 
                      alt={displayName}
                      className="object-cover"
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">{displayName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  data-testid="menu-item-help"
                >
                  Help
                  <HelpCircle className="h-4 w-4 ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="menu-item-logout"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-[#1ba9af]/20">
          <DialogHeader className="border-b border-[#1ba9af]/10 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#1ba9af] via-[#2dd4bf] to-[#1ba9af] bg-clip-text text-transparent">
              Search Movies
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800/50 border-[#1ba9af]/30 focus:border-[#1ba9af] focus-visible:ring-[#1ba9af] focus-visible:ring-opacity-50 text-white placeholder:text-zinc-400"
                autoFocus
                data-testid="input-search"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1ba9af]/50" />
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && searchQuery.length === 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1ba9af]">
                    <Clock className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-zinc-400 hover:text-[#1ba9af] transition-colors"
                    data-testid="button-clear-history"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {searchHistory.slice(0, 5).map((movie, index) => (
                    <div
                      key={`history-${movie.id}-${index}`}
                      className="group relative flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-[#1ba9af]/10 hover:border-[#1ba9af]/30 hover:bg-zinc-800/50 cursor-pointer transition-all"
                      onClick={() => handleHistoryClick(movie)}
                      data-testid={`search-history-${movie.id}`}
                    >
                      {movie.posterUrl && (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-14 h-20 object-cover rounded shadow-lg"
                        />
                      )}
                      {!movie.posterUrl && (
                        <div className="w-14 h-20 bg-zinc-700/50 rounded flex items-center justify-center">
                          <Tv className="h-6 w-6 text-[#1ba9af]/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 text-white flex items-center gap-2">
                          {movie.title}
                          <span className="text-xs text-zinc-400">
                            ({movie.year})
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                          {movie.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1ba9af]/10 text-[#1ba9af] border border-[#1ba9af]/20">
                            {movie.genre}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <div className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1ba9af] hover:text-[#2dd4bf]">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="space-y-2">
              {searchQuery.length > 0 && (
                <div className="text-sm font-medium text-[#1ba9af] mb-2">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'result' : 'results'} found
                </div>
              )}
              <div className="max-h-[350px] overflow-y-auto space-y-2">
                {searchQuery.length > 0 && filteredMovies.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-[#1ba9af]/30 mx-auto mb-3" />
                    <p className="text-zinc-400">
                      No movies found matching "{searchQuery}"
                    </p>
                  </div>
                )}
                {searchQuery.length === 0 && movies.length > 0 && searchHistory.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-[#1ba9af]/30 mx-auto mb-3" />
                    <p className="text-zinc-400">
                      Start typing to search through {movies.length} movies
                    </p>
                  </div>
                )}
                {searchQuery.length > 0 && filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-[#1ba9af]/10 hover:border-[#1ba9af]/30 hover:bg-zinc-800/50 cursor-pointer transition-all"
                    onClick={() => handleMovieClick(movie.id)}
                    data-testid={`search-result-${movie.id}`}
                  >
                    {movie.posterUrl && (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-14 h-20 object-cover rounded shadow-lg"
                      />
                    )}
                    {!movie.posterUrl && (
                      <div className="w-14 h-20 bg-zinc-700/50 rounded flex items-center justify-center">
                        <Tv className="h-6 w-6 text-[#1ba9af]/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 text-white flex items-center gap-2">
                        {movie.title}
                        <span className="text-xs text-zinc-400">
                          ({movie.year})
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                        {movie.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1ba9af]/10 text-[#1ba9af] border border-[#1ba9af]/20">
                          {movie.genre}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                        </span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#1ba9af] hover:text-[#2dd4bf]">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

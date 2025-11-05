import { Link, useLocation } from "wouter";
import { Film, Zap, Tv } from "lucide-react";

interface HeaderProps {
  userId?: string;
}

export function Header({ userId }: HeaderProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" data-testid="link-home">
          <h1 className="cursor-pointer font-display text-3xl font-extrabold tracking-wider text-primary transition-colors hover-elevate">
            Krittics
          </h1>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/browse" data-testid="link-browse">
            <button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-all hover-elevate ${
                location === "/browse"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">Browse</span>
            </button>
          </Link>
          <Link href="/" data-testid="link-movie-player">
            <button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-all hover-elevate ${
                location === "/"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Player</span>
            </button>
          </Link>
          <Link href="/krossfire" data-testid="link-krossfire">
            <button
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-all hover-elevate ${
                location === "/krossfire"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Krossfire</span>
            </button>
          </Link>
        </nav>

        {userId && (
          <div className="hidden text-sm text-muted-foreground md:block" data-testid="text-user-id">
            <span className="font-mono">
              {userId.substring(0, 8)}...
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

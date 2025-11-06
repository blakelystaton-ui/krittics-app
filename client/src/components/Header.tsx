import { Link, useLocation } from "wouter";
import { Zap, Tv, LogIn } from "lucide-react";
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

export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" data-testid="link-home">
          <h1 className="cursor-pointer font-display text-3xl font-extrabold tracking-wider text-primary transition-colors hover-elevate">
            Krittics
          </h1>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/" data-testid="link-browse">
            <button className="gradient-border-button">
              <span className="gradient-border-content">
                <Tv className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Browse</span>
              </span>
            </button>
          </Link>
          <Link href="/krossfire" data-testid="link-krossfire">
            <button className="gradient-border-button">
              <span className="gradient-border-content">
                <Zap className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Krossfire</span>
              </span>
            </button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && !isAuthenticated && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-sign-in"
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
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
    </header>
  );
}

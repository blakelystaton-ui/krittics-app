import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { User } from '@shared/schema';

interface FriendSearchDropdownProps {
  onSelectFriend: (friend: User) => void;
  placeholder?: string;
}

export function FriendSearchDropdown({ onSelectFriend, placeholder }: FriendSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/friends/search', searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to search friends');
      }
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    setShowResults(searchQuery.length >= 2);
  }, [searchQuery]);

  const handleSelectFriend = (friend: User) => {
    onSelectFriend(friend);
    setSearchQuery('');
    setShowResults(false);
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || "Search friends by name or email..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="pl-10"
          data-testid="input-friend-search"
        />
      </div>

      {showResults && (
        <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto shadow-lg">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && searchResults.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend)}
                  className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate active-elevate-2 transition-all text-left"
                  data-testid={`button-select-friend-${friend.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.profileImageUrl ?? undefined} alt={friend.firstName ?? 'User'} />
                    <AvatarFallback>
                      {getInitials(friend.firstName ?? undefined, friend.lastName ?? undefined, friend.email ?? undefined)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {friend.firstName && friend.lastName 
                        ? `${friend.firstName} ${friend.lastName}`
                        : friend.firstName || 'Krittic User'}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {friend.email}
                    </div>
                  </div>

                  <UserPlus className="h-5 w-5 text-[#1ba9af] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

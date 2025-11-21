import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { User } from '@shared/schema';

interface FriendInvitePopoverProps {
  onSelectFriend: (friend: User) => void;
  existingMemberIds?: string[];
}

export function FriendInvitePopover({ onSelectFriend, existingMemberIds = [] }: FriendInvitePopoverProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch top friends by interaction count
  const { data: topFriends = [] } = useQuery<(User & { interactionCount: number })[]>({
    queryKey: ['/api/friends'],
    enabled: isOpen,
  });

  // Search users
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
    enabled: isOpen && searchQuery.length >= 2,
  });

  const handleSelectFriend = (friend: User) => {
    onSelectFriend(friend);
    setSearchQuery('');
    setIsOpen(false);
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

  // Filter out existing members
  const filteredTopFriends = topFriends
    .filter(friend => !existingMemberIds.includes(friend.id))
    .slice(0, 5);
  
  const filteredSearchResults = searchResults
    .filter(friend => !existingMemberIds.includes(friend.id));

  const displayedFriends = searchQuery.length >= 2 ? filteredSearchResults : filteredTopFriends;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          className="h-8 px-2 gap-1 border-[var(--teal)]/30 text-[var(--teal)]"
          data-testid="button-add-member"
        >
          <UserPlus className="h-4 w-4" />
          <span className="text-xs">Add</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        data-testid="popover-friend-invite"
      >
        <div className="p-3 border-b space-y-3">
          <div className="text-sm font-semibold">Invite to Crew</div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-invite-search"
            />
          </div>
        </div>

        {/* Friend List */}
        <div className="max-h-80 overflow-y-auto">
          {searchQuery.length < 2 && (
            <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50">
              Top Friends
            </div>
          )}

          {isLoading && searchQuery.length >= 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && searchQuery.length >= 2 && displayedFriends.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          )}

          {searchQuery.length < 2 && displayedFriends.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No friend suggestions available
            </div>
          )}

          {displayedFriends.length > 0 && (
            <div className="p-2">
              {displayedFriends.map((friend, index) => {
                const isTopFriend = searchQuery.length < 2;
                const friendWithCount = friend as User & { interactionCount?: number };
                const interactionCount = friendWithCount.interactionCount ?? 0;
                
                return (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate active-elevate-2 transition-all text-left"
                    data-testid={`button-invite-friend-${friend.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.profileImageUrl ?? undefined} alt={friend.firstName ?? 'User'} />
                      <AvatarFallback>
                        {getInitials(friend.firstName ?? undefined, friend.lastName ?? undefined, friend.email ?? undefined)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {friend.firstName && friend.lastName 
                          ? `${friend.firstName} ${friend.lastName}`
                          : friend.firstName || 'Krittic User'}
                        {isTopFriend && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-[var(--teal)]/20 text-[var(--teal)] border-[var(--teal)]/30"
                          >
                            #{index + 1}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {friend.email}
                        {isTopFriend && interactionCount > 0 && (
                          <span className="ml-2 text-xs text-[var(--teal)]">
                            • {interactionCount} interaction{interactionCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <UserPlus className="h-5 w-5 text-[var(--teal)] flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

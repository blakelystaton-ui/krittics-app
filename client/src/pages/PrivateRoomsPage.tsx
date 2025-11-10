import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useFirebase } from '@/lib/firebase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove, 
  addDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ArrowLeft, Crown, Send, Users, UserPlus, Search } from 'lucide-react';
import type { User } from '@shared/schema';

interface RoomData {
  roomCode: string;
  roomName: string;
  hostId: string;
  movieTitle: string;
  members: string[];
  status: 'lobby' | 'playing' | 'finished';
  createdAt: any;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
}

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function PrivateRoomsPage() {
  const [, setLocation] = useLocation();
  const { db, userId, isAuthReady, isFirebaseConfigured, authError } = useFirebase();
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showFriendsSection, setShowFriendsSection] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const roomsCollectionPath = useMemo(() => 'krittics/multiplayer/rooms', []);

  // Fetch friends
  const { data: friends = [] } = useQuery<(User & { interactionCount: number })[]>({
    queryKey: ['/api/friends'],
    enabled: isAuthReady && showFriendsSection,
  });

  // Search users
  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ['/api/friends/search', friendSearchQuery],
    enabled: isAuthReady && showFriendsSection && friendSearchQuery.trim().length >= 2,
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return await apiRequest('POST', `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      setFriendSearchQuery('');
      setStatusMessage('Friend added successfully!');
    },
  });

  // Real-time listener for the current room
  useEffect(() => {
    if (!db || !isAuthReady || !roomCode || !isFirebaseConfigured) return;

    const roomRef = doc(db, roomsCollectionPath, roomCode);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomData = docSnap.data() as RoomData;
        if (roomData.members.includes(userId!)) {
          setCurrentRoom(roomData);
          setStatusMessage(`Joined room: ${roomData.roomName}`);
        } else {
          setCurrentRoom(null);
          setRoomCode('');
          setStatusMessage('You have left or been removed from the room.');
        }
      } else {
        setCurrentRoom(null);
        setRoomCode('');
        setStatusMessage('The room you were in no longer exists.');
      }
    }, (error) => {
      console.error("Error fetching room data:", error);
      setStatusMessage('Error connecting to room.');
    });

    return () => unsubscribe();
  }, [db, isAuthReady, roomCode, roomsCollectionPath, userId, isFirebaseConfigured]);
  
  // Real-time listener for chat messages
  useEffect(() => {
    if (!db || !currentRoom || !isFirebaseConfigured) {
      setMessages([]);
      return;
    }

    const messagesCollectionPath = `${roomsCollectionPath}/${currentRoom.roomCode}/messages`;
    const q = query(
      collection(db, messagesCollectionPath),
      orderBy('timestamp', 'asc') 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(msgs);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [db, currentRoom, roomsCollectionPath, isFirebaseConfigured]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !userId || !currentRoom || newMessage.trim() === '' || !isFirebaseConfigured) return;

    const messagesCollectionPath = `${roomsCollectionPath}/${currentRoom.roomCode}/messages`;
    
    try {
      await addDoc(collection(db, messagesCollectionPath), {
        userId,
        userName: `Krittic-${userId.substring(0, 4)}`,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateRoom = async () => {
    if (!db || !userId || !isFirebaseConfigured) {
      setStatusMessage('Firebase is not configured. Please configure Firebase secrets to enable multiplayer features.');
      return;
    }

    const newCode = generateRoomCode();
    const roomName = `Private Room by Krittic-${userId.substring(0, 4)}`;
    const roomRef = doc(db, roomsCollectionPath, newCode);

    try {
      await setDoc(roomRef, {
        roomCode: newCode,
        roomName,
        hostId: userId,
        movieTitle: 'Movie Selection Pending...',
        members: [userId],
        status: 'lobby',
        createdAt: serverTimestamp(),
      });

      setRoomCode(newCode);
      setStatusMessage(`Room created! Share code: ${newCode}`);

    } catch (error) {
      console.error("Error creating room:", error);
      setStatusMessage('Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    if (!db || !userId || !joinInput || !isFirebaseConfigured) {
      setStatusMessage('Please enter a room code.');
      return;
    }
    
    const code = joinInput.toUpperCase().trim();
    const roomRef = doc(db, roomsCollectionPath, code);

    try {
      await updateDoc(roomRef, {
        members: arrayUnion(userId)
      });
      
      setRoomCode(code);
      setJoinInput('');
      setStatusMessage(`Successfully joined room ${code}.`);

    } catch (error) {
      console.error("Error joining room:", error);
      setStatusMessage(`Failed to join room ${code}. Check the code and try again.`);
    }
  };
  
  const handleLeaveRoom = async () => {
    if (!db || !currentRoom || !isFirebaseConfigured) return;

    const roomRef = doc(db, roomsCollectionPath, currentRoom.roomCode);

    if (currentRoom.hostId === userId) {
      try {
        await deleteDoc(roomRef);
        setStatusMessage(`Room ${currentRoom.roomCode} deleted.`);
      } catch (error) {
        console.error("Error deleting room:", error);
        setStatusMessage('Failed to delete room.');
      }
    } else {
      try {
        await updateDoc(roomRef, {
          members: arrayRemove(userId)
        });
        setStatusMessage(`You left room ${currentRoom.roomCode}.`);
      } catch (error) {
        console.error("Error leaving room:", error);
        setStatusMessage('Failed to leave room.');
      }
    }
    
    setCurrentRoom(null);
    setRoomCode('');
    setMessages([]);
    setLocation('/krossfire');
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground animate-pulse">Loading authentication...</p>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    // Determine error message based on error type
    let errorTitle = "Firebase Configuration Required";
    let errorContent;

    if (authError === 'missing-secrets') {
      errorTitle = "Firebase Secrets Not Configured";
      errorContent = (
        <>
          <p className="text-sm mb-4">
            Private rooms require Firebase to be configured. Please provide the following secrets in your Replit environment:
          </p>
          <div className="space-y-2 text-sm">
            <code className="block p-2 bg-muted rounded text-xs">
              VITE_FIREBASE_PROJECT_ID<br/>
              VITE_FIREBASE_APP_ID<br/>
              VITE_FIREBASE_API_KEY
            </code>
          </div>
        </>
      );
    } else if (authError === 'anonymous-auth-disabled') {
      errorTitle = "Firebase Anonymous Authentication Required";
      errorContent = (
        <>
          <p className="text-sm mb-4">
            Your Firebase secrets are configured, but Anonymous Authentication is not enabled in your Firebase project.
          </p>
          
          <div className="space-y-3 text-sm">
            <p className="font-semibold">To enable Anonymous Authentication:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a></li>
              <li>Select your project: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">krittics-5bcc9</code></li>
              <li>Click <strong>"Authentication"</strong> in the left sidebar</li>
              <li>Click the <strong>"Sign-in method"</strong> tab</li>
              <li>Find <strong>"Anonymous"</strong> in the providers list</li>
              <li>Click on it and toggle <strong>"Enable"</strong> to ON</li>
              <li>Click <strong>"Save"</strong></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded text-xs">
            <p className="font-semibold mb-1">Why Anonymous Auth?</p>
            <p>Anonymous authentication allows users to use multiplayer features without creating accounts, while still maintaining secure, user-specific sessions in Firebase.</p>
          </div>
        </>
      );
    } else {
      // Other errors (network, initialization, etc.)
      errorTitle = "Firebase Connection Error";
      errorContent = (
        <>
          <p className="text-sm mb-4">
            Unable to connect to Firebase. This could be due to network issues, invalid configuration, or Firebase service problems.
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Error details:</p>
            <code className="block p-2 bg-muted rounded text-xs break-all">
              {authError || 'Unknown error'}
            </code>
            <p className="mt-3">
              Please check your internet connection and Firebase configuration. If the problem persists, check the browser console for more details.
            </p>
          </div>
        </>
      );
    }

    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/krossfire')}
          className="mb-6"
          data-testid="button-back-to-krossfire"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Krossfire
        </Button>
        
        <Alert className="border-yellow-500/50">
          <AlertDescription>
            <h3 className="font-semibold mb-3 text-lg">{errorTitle}</h3>
            {errorContent}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (currentRoom) {
    const isHost = currentRoom.hostId === userId;
    
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - Room info and chat */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-room-lobby">
              <CardHeader className="teal-gradient-bg p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-foreground">{currentRoom.roomName}</CardTitle>
                    <CardDescription className="mt-2 text-foreground/80 flex items-center flex-wrap gap-2">
                      Room Code:
                      <span className="gradient-border-button inline-flex min-h-0 px-3 py-1">
                        <span className="gradient-border-content font-mono text-lg">
                          {currentRoom.roomCode}
                        </span>
                      </span>
                    </CardDescription>
                  </div>
                  {isHost && (
                    <Badge variant="default" className="bg-[var(--teal)] hover:bg-[var(--teal-light)] flex-shrink-0">
                      <div className="teal-icon-glow mr-1.5 flex h-4 w-4 items-center justify-center rounded-full p-0.5">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                      Host
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleLeaveRoom}
                    variant={isHost ? "destructive" : "secondary"}
                    data-testid="button-leave-room"
                  >
                    {isHost ? 'End Session (Delete Room)' : 'Leave Room'}
                  </Button>
                  {isHost && (
                    <button
                      onClick={() => setStatusMessage('Feature coming soon! This button will sync everyone to a selected movie.')}
                      disabled
                      className="gradient-border-button min-h-9 px-4 opacity-50 cursor-not-allowed"
                      data-testid="button-start-movie"
                    >
                      <span className="gradient-border-content">
                        Start Movie Sync
                      </span>
                    </button>
                  )}
                </div>

                {statusMessage && (
                  <Alert>
                    <AlertDescription data-testid="text-status-message">{statusMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card>
              <CardHeader>
                <CardTitle>Live Room Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-3 pb-3" data-testid="chat-messages">
                    {messages.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Start the conversation!</p>
                    )}
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <div className={`max-w-[75%] p-3 rounded-lg ${
                          msg.userId === userId 
                            ? 'bg-[var(--teal)]/20 border border-[var(--teal)]/40 text-foreground rounded-br-none' 
                            : 'bg-muted rounded-tl-none'
                        }`}>
                          <p className="text-xs font-semibold mb-1 opacity-80">
                            {msg.userId === userId ? 'You' : msg.userName}
                          </p>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send a message..."
                      maxLength={250}
                      disabled={!isAuthReady}
                      data-testid="input-chat-message"
                    />
                    <Button
                      type="submit"
                      disabled={!isAuthReady || newMessage.trim() === ''}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Member list sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="teal-icon-subtle flex h-8 w-8 items-center justify-center rounded-md">
                    <Users className="h-5 w-5" />
                  </div>
                  Members ({currentRoom.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2" data-testid="member-list">
                  {currentRoom.members.map(memberId => (
                    <div 
                      key={memberId} 
                      className={`p-3 rounded-md flex justify-between items-center ${
                        memberId === currentRoom.hostId ? 'bg-primary/10' : 'bg-muted'
                      }`}
                      data-testid={`member-${memberId}`}
                    >
                      <span className="text-sm">
                        {memberId === userId ? 'You' : `Krittic-${memberId.substring(0, 4)}`}
                      </span>
                      {memberId === currentRoom.hostId && (
                        <Badge variant="secondary" className="text-xs bg-[var(--teal)]/20 text-[var(--teal)] border-[var(--teal)]/30">
                          <div className="teal-icon-glow mr-1 flex h-3 w-3 items-center justify-center rounded-full p-0.5">
                            <Crown className="h-2 w-2 text-white" />
                          </div>
                          HOST
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Create/Join view
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-6" />
      
      <Card className="overflow-hidden">
        <CardHeader className="teal-gradient-bg p-8 text-center">
          <CardTitle className="text-3xl text-foreground">Crew Command Center</CardTitle>
          <CardDescription className="text-foreground/80 mt-2">
            Crew HQ: sync-watch, unite or duel in trivia with the Crew
          </CardDescription>
        </CardHeader>
        <CardContent 
          className="space-y-6 pt-8"
          style={{
            background: 'linear-gradient(to bottom right, rgba(27, 169, 175, 0.2), rgba(27, 169, 175, 0.05))'
          }}
        >
          {statusMessage && (
            <Alert>
              <AlertDescription data-testid="text-status-message">{statusMessage}</AlertDescription>
            </Alert>
          )}

          {/* Create Room */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Create a Room</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Become the host and get a unique code to share with friends
              </p>
            </div>
            <button
              onClick={() => {
                handleCreateRoom();
                setShowFriendsSection(true);
              }}
              disabled={!isAuthReady}
              className="gradient-border-button min-h-10 px-6"
              data-testid="button-create-room"
            >
              <span className="gradient-border-content">
                Generate Crew Call
              </span>
            </button>

            {/* Friends Section */}
            {showFriendsSection && isAuthReady && (
              <Card className="mt-6 overflow-hidden" data-testid="card-friends-section">
                <CardHeader className="bg-gradient-to-br from-[var(--teal)]/20 to-[var(--teal)]/5">
                  <CardTitle className="flex items-center gap-2">
                    <div className="teal-icon-subtle flex h-8 w-8 items-center justify-center rounded-md">
                      <Users className="h-5 w-5" />
                    </div>
                    Invite Friends
                  </CardTitle>
                  <CardDescription>Search for friends or select from your most frequent collaborators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Search Bar */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search for friends by name or email..."
                          value={friendSearchQuery}
                          onChange={(e) => setFriendSearchQuery(e.target.value)}
                          className="pl-10"
                          data-testid="input-friend-search"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (friendSearchQuery.trim().length < 2) {
                            setStatusMessage('Please enter at least 2 characters to search');
                          }
                        }}
                        disabled={friendSearchQuery.trim().length < 2}
                        className="gradient-border-button min-h-9 px-4"
                        data-testid="button-search-friends"
                      >
                        <span className="gradient-border-content flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Search
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {friendSearchQuery.trim().length >= 2 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">Search Results</h4>
                      {searchResults.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No users found</p>
                      ) : (
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <div 
                              key={user.id} 
                              className="flex items-center justify-between p-3 rounded-md bg-muted hover-elevate"
                              data-testid={`search-result-${user.id}`}
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}` 
                                    : user.email || 'Unknown User'}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addFriendMutation.mutate(user.id)}
                                disabled={addFriendMutation.isPending}
                                data-testid={`button-add-friend-${user.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Top Friends */}
                  {friendSearchQuery.trim().length < 2 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Your Top Friends {friends.length > 0 && `(${friends.length})`}
                      </h4>
                      {friends.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">No friends yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Use the search bar above to find and add friends</p>
                        </div>
                      ) : (
                        <div className="space-y-2" data-testid="friends-list">
                          {friends.map((friend, index) => (
                            <div 
                              key={friend.id} 
                              className="flex items-center justify-between p-3 rounded-md bg-muted hover-elevate"
                              data-testid={`friend-${friend.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--teal)]/20 border border-[var(--teal)]/40">
                                  <span className="text-xs font-bold text-[var(--teal)]">#{index + 1}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {friend.firstName && friend.lastName 
                                      ? `${friend.firstName} ${friend.lastName}` 
                                      : friend.email || 'Unknown User'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {friend.interactionCount} interaction{friend.interactionCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/30"
                              >
                                Friend
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Player Requests */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">2. Player Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View and respond to play or watch requests from friends
              </p>
            </div>
            
            <Card className="overflow-hidden" data-testid="card-player-requests">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When friends send you play or watch invitations, they'll appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

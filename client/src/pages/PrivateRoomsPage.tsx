import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useFirebase } from '@/lib/firebase';
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
import { ArrowLeft, Crown, Send, Users } from 'lucide-react';

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
  const { db, userId, isAuthReady, isFirebaseConfigured } = useFirebase();
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const roomsCollectionPath = useMemo(() => 'krittics/multiplayer/rooms', []);

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
        
        <Alert>
          <AlertDescription>
            <h3 className="font-semibold mb-2">Firebase Not Configured</h3>
            <p className="text-sm">
              Private rooms require Firebase to be configured. Please set up your Firebase project and provide the required secrets:
              <code className="block mt-2 p-2 bg-muted rounded text-xs">
                VITE_FIREBASE_PROJECT_ID<br/>
                VITE_FIREBASE_APP_ID<br/>
                VITE_FIREBASE_API_KEY
              </code>
            </p>
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentRoom.roomName}</CardTitle>
                    <CardDescription className="mt-2">
                      Room Code: <Badge variant="outline" className="ml-2 font-mono text-lg">{currentRoom.roomCode}</Badge>
                    </CardDescription>
                  </div>
                  {isHost && <Badge variant="default"><Crown className="mr-1 h-3 w-3" />Host</Badge>}
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
                    <Button
                      onClick={() => setStatusMessage('Feature coming soon! This button will sync everyone to a selected movie.')}
                      variant="default"
                      disabled
                      data-testid="button-start-movie"
                    >
                      Start Movie Sync
                    </Button>
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
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
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
                  <Users className="h-5 w-5" />
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
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="mr-1 h-3 w-3" />
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
      <Button 
        variant="ghost" 
        onClick={() => setLocation('/krossfire')}
        className="mb-6"
        data-testid="button-back-to-krossfire"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Krossfire
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Private Social Viewing Rooms</CardTitle>
          <CardDescription>
            Watch and play trivia together with friends in private rooms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Button
              onClick={handleCreateRoom}
              disabled={!isAuthReady}
              size="lg"
              data-testid="button-create-room"
            >
              Generate Private Room
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Join Room */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">2. Join a Friend's Room</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the code your friend shared to join their session
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Room Code (e.g., A1B2C3)"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1"
                data-testid="input-room-code"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!isAuthReady || joinInput.length !== 6}
                data-testid="button-join-room"
              >
                Join Room
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

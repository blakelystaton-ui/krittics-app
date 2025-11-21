import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  setDoc,
  doc,
  Firestore,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private db: Firestore;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(this.app);
  }

  /**
   * Get real-time chat messages for a crew room
   */
  getRoomMessages(roomCode: string): Observable<ChatMessage[]> {
    return new Observable(observer => {
      const messagesRef = collection(
        this.db,
        `krittics/multiplayer/rooms/${roomCode}/messages`
      );
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            messages.push({
              id: doc.id,
              userId: data['userId'] || '',
              userName: data['userName'] || 'Anonymous',
              userAvatar: data['userAvatar'],
              message: data['message'] || '',
              timestamp: data['timestamp']?.toDate() || new Date()
            });
          });
          // Reverse to show oldest first
          observer.next(messages.reverse());
        },
        (error) => {
          console.error('Error fetching messages:', error);
          observer.error(error);
        }
      );

      // Cleanup subscription
      return () => unsubscribe();
    });
  }

  /**
   * Send a message to a crew room
   */
  async sendMessage(
    roomCode: string,
    userId: string,
    userName: string,
    message: string,
    userAvatar?: string
  ): Promise<void> {
    try {
      const messagesRef = collection(
        this.db,
        `krittics/multiplayer/rooms/${roomCode}/messages`
      );

      await addDoc(messagesRef, {
        userId,
        userName,
        userAvatar,
        message,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Create a private crew room with access control
   */
  async createRoom(roomCode: string, roomData: any): Promise<void> {
    try {
      const roomRef = doc(this.db, `krittics/multiplayer/rooms/${roomCode}`);
      
      await setDoc(roomRef, {
        ...roomData,
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now()
      });
      
      console.log('Private room created:', roomCode);
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }
}

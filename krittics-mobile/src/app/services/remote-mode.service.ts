import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  doc,
  updateDoc,
  onSnapshot,
  getFirestore,
  Timestamp,
  deleteField
} from 'firebase/firestore';

export interface RemoteParticipant {
  userId: string;
  userName: string;
  deviceType: 'phone' | 'tablet' | 'desktop';
  activatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteModeService {
  private isRemoteModeActive$ = new BehaviorSubject<boolean>(false);
  private remoteParticipants$ = new BehaviorSubject<Map<string, RemoteParticipant>>(new Map());
  private currentRoomCode: string | null = null;

  constructor() {}

  /**
   * Check if current device is in remote mode
   */
  isRemoteMode(): Observable<boolean> {
    return this.isRemoteModeActive$.asObservable();
  }

  /**
   * Get all participants currently in remote mode
   */
  getRemoteParticipants(): Observable<Map<string, RemoteParticipant>> {
    return this.remoteParticipants$.asObservable();
  }

  /**
   * Toggle remote mode for current user
   */
  async toggleRemoteMode(
    roomCode: string,
    userId: string,
    userName: string,
    enable: boolean
  ): Promise<void> {
    try {
      const db = getFirestore();
      const roomRef = doc(db, `krittics/multiplayer/rooms/${roomCode}`);

      const deviceType = this.detectDeviceType();
      
      if (enable) {
        // Enable remote mode
        await updateDoc(roomRef, {
          [`remoteParticipants.${userId}`]: {
            userId,
            userName,
            deviceType,
            activatedAt: Timestamp.now()
          }
        });
        this.isRemoteModeActive$.next(true);
      } else {
        // Disable remote mode - use deleteField to properly remove
        await updateDoc(roomRef, {
          [`remoteParticipants.${userId}`]: deleteField()
        });
        this.isRemoteModeActive$.next(false);
      }
    } catch (error) {
      console.error('Error toggling remote mode:', error);
      throw error;
    }
  }

  /**
   * Subscribe to remote participants changes in a room
   */
  subscribeToRemoteParticipants(roomCode: string): () => void {
    this.currentRoomCode = roomCode;
    const db = getFirestore();
    const roomRef = doc(db, `krittics/multiplayer/rooms/${roomCode}`);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      const remoteParticipants = data?.['remoteParticipants'] || {};
      
      const participantsMap = new Map<string, RemoteParticipant>();
      Object.entries(remoteParticipants).forEach(([userId, participant]: [string, any]) => {
        if (participant) {
          participantsMap.set(userId, {
            userId: participant.userId,
            userName: participant.userName,
            deviceType: participant.deviceType,
            activatedAt: participant.activatedAt?.toDate() || new Date()
          });
        }
      });
      
      this.remoteParticipants$.next(participantsMap);
    });

    return unsubscribe;
  }

  /**
   * Detect device type based on screen size and user agent
   */
  private detectDeviceType(): 'phone' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    const ua = navigator.userAgent.toLowerCase();

    if (width < 768 || ua.includes('mobile')) {
      return 'phone';
    } else if (width < 1024 || ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Reset remote mode state (call on unmount)
   */
  reset() {
    this.isRemoteModeActive$.next(false);
    this.remoteParticipants$.next(new Map());
    this.currentRoomCode = null;
  }
}

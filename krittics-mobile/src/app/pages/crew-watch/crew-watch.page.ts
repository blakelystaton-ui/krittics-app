import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService, ChatMessage } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { RemoteModeService } from '../../services/remote-mode.service';
import { FloatingChatComponent } from '../../components/floating-chat/floating-chat.component';
import { ChatInputBarComponent } from '../../components/chat-input-bar/chat-input-bar.component';
import { RemoteModeViewComponent } from '../../components/remote-mode-view/remote-mode-view.component';

@Component({
  selector: 'app-crew-watch',
  templateUrl: './crew-watch.page.html',
  styleUrls: ['./crew-watch.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FloatingChatComponent,
    ChatInputBarComponent,
    RemoteModeViewComponent
  ]
})
export class CrewWatchPage implements OnInit, OnDestroy {
  roomCode: string = '';
  movieUrl: string = '';
  isPlaying: boolean = false;
  showFloatingChat: boolean = false;
  messages: ChatMessage[] = [];
  cachedRecentMessages: ChatMessage[] = [];
  isRemoteMode: boolean = false;
  showRemoteToggle: boolean = false;
  
  private messagesSubscription?: Subscription;
  private remoteModeSubscription?: Subscription;
  private remoteParticipantsUnsubscribe?: () => void;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private remoteModeService: RemoteModeService,
    private platform: Platform
  ) {}

  ngOnInit() {
    // Check if device should show remote toggle (phones/tablets)
    const width = this.platform.width();
    this.showRemoteToggle = width < 1024;

    // Get room code and movie from route params
    this.route.queryParams.subscribe(params => {
      this.roomCode = params['roomCode'] || '';
      this.movieUrl = params['movieUrl'] || '';
      
      if (this.roomCode) {
        this.subscribeToMessages();
        this.subscribeToRemoteMode();
        this.remoteParticipantsUnsubscribe = this.remoteModeService.subscribeToRemoteParticipants(this.roomCode);
      }
    });
  }

  ngOnDestroy() {
    this.messagesSubscription?.unsubscribe();
    this.remoteModeSubscription?.unsubscribe();
    if (this.remoteParticipantsUnsubscribe) {
      this.remoteParticipantsUnsubscribe();
    }
    this.remoteModeService.reset();
  }

  subscribeToRemoteMode() {
    this.remoteModeSubscription = this.remoteModeService.isRemoteMode().subscribe(
      isRemote => this.isRemoteMode = isRemote
    );
  }

  subscribeToMessages() {
    this.messagesSubscription = this.firebaseService
      .getRoomMessages(this.roomCode)
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          // Keep last 3 messages for remote mode preview
          this.cachedRecentMessages = messages.slice(-3);
        },
        error: (error) => {
          console.error('Error loading messages:', error);
        }
      });
  }

  onVideoPlay() {
    this.isPlaying = true;
    this.showFloatingChat = true;
  }

  onVideoPause() {
    this.isPlaying = false;
    this.showFloatingChat = false;
  }

  onVideoEnded() {
    this.isPlaying = false;
    this.showFloatingChat = false;
  }

  async onSendMessage(message: string) {
    const user = this.authService.user;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      await this.firebaseService.sendMessage(
        this.roomCode,
        user.id,
        `${user.firstName} ${user.lastName}` || 'Anonymous',
        message,
        {
          userAvatar: user.profileImageUrl,
          mode: this.isRemoteMode ? 'remote' : 'standard',
          deviceType: this.getDeviceType()
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  async onRemoteMessageSent(event: { text: string; isVoice: boolean }) {
    const user = this.authService.user;
    if (!user) return;

    try {
      await this.firebaseService.sendMessage(
        this.roomCode,
        user.id,
        `${user.firstName} ${user.lastName}` || 'Anonymous',
        event.text,
        {
          userAvatar: user.profileImageUrl,
          mode: event.isVoice ? 'voice' : 'remote',
          isVoice: event.isVoice,
          deviceType: this.getDeviceType()
        }
      );
    } catch (error) {
      console.error('Failed to send remote message:', error);
    }
  }

  async onReactionSent(emoji: string) {
    const user = this.authService.user;
    if (!user) return;

    try {
      await this.firebaseService.sendMessage(
        this.roomCode,
        user.id,
        `${user.firstName} ${user.lastName}` || 'Anonymous',
        emoji,
        {
          userAvatar: user.profileImageUrl,
          mode: 'reaction',
          reactionType: emoji,
          deviceType: this.getDeviceType()
        }
      );
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  }

  async toggleRemoteMode() {
    const user = this.authService.user;
    if (!user) return;

    try {
      const newState = !this.isRemoteMode;
      await this.remoteModeService.toggleRemoteMode(
        this.roomCode,
        user.id,
        `${user.firstName} ${user.lastName}`,
        newState
      );
    } catch (error) {
      console.error('Failed to toggle remote mode:', error);
    }
  }

  get recentMessages() {
    return this.cachedRecentMessages;
  }

  private getDeviceType(): 'phone' | 'tablet' | 'desktop' {
    const width = this.platform.width();
    if (width < 768) return 'phone';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

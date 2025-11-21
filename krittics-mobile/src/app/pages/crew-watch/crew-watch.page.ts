import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService, ChatMessage } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { FloatingChatComponent } from '../../components/floating-chat/floating-chat.component';
import { ChatInputBarComponent } from '../../components/chat-input-bar/chat-input-bar.component';

@Component({
  selector: 'app-crew-watch',
  templateUrl: './crew-watch.page.html',
  styleUrls: ['./crew-watch.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FloatingChatComponent,
    ChatInputBarComponent
  ]
})
export class CrewWatchPage implements OnInit, OnDestroy {
  roomCode: string = '';
  movieUrl: string = '';
  isPlaying: boolean = false;
  showFloatingChat: boolean = false;
  messages: ChatMessage[] = [];
  
  private messagesSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get room code and movie from route params
    this.route.queryParams.subscribe(params => {
      this.roomCode = params['roomCode'] || '';
      this.movieUrl = params['movieUrl'] || '';
      
      if (this.roomCode) {
        this.subscribeToMessages();
      }
    });
  }

  ngOnDestroy() {
    this.messagesSubscription?.unsubscribe();
  }

  subscribeToMessages() {
    this.messagesSubscription = this.firebaseService
      .getRoomMessages(this.roomCode)
      .subscribe({
        next: (messages) => {
          this.messages = messages;
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
        user.profileImageUrl
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
}

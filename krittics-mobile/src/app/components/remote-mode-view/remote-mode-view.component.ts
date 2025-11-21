import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { VoiceInputService } from '../../services/voice-input.service';

export interface QuickReaction {
  emoji: string;
  name: string;
}

@Component({
  selector: 'app-remote-mode-view',
  templateUrl: './remote-mode-view.component.html',
  styleUrls: ['./remote-mode-view.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RemoteModeViewComponent implements OnInit, OnDestroy {
  @Input() userName = 'User';
  @Input() recentMessages: any[] = [];
  @Output() messageSent = new EventEmitter<{ text: string; isVoice: boolean }>();
  @Output() reactionSent = new EventEmitter<string>();
  @Output() exitRemote = new EventEmitter<void>();

  messageText = '';
  isListening = false;
  voiceSupported = false;

  quickReactions: QuickReaction[] = [
    { emoji: '😂', name: 'laughing' },
    { emoji: '🔥', name: 'fire' },
    { emoji: '😍', name: 'heart-eyes' },
    { emoji: '👏', name: 'clapping' },
    { emoji: '💯', name: 'hundred' },
    { emoji: '🎉', name: 'party' },
    { emoji: '🙌', name: 'raised-hands' },
    { emoji: '👀', name: 'eyes' }
  ];

  constructor(private voiceInputService: VoiceInputService) {}

  ngOnInit() {
    this.voiceSupported = this.voiceInputService.isSupported();
  }

  ngOnDestroy() {
    this.voiceInputService.stopListening();
  }

  onSendMessage() {
    if (!this.messageText.trim()) return;

    this.messageSent.emit({
      text: this.messageText.trim(),
      isVoice: false
    });
    this.messageText = '';
  }

  async onVoiceInput() {
    if (this.isListening) {
      this.voiceInputService.stopListening();
      this.isListening = false;
      return;
    }

    this.isListening = true;
    
    await this.voiceInputService.startListening(
      (transcript) => {
        this.messageText = transcript;
        this.isListening = false;
        // Auto-send voice messages
        this.messageSent.emit({
          text: transcript,
          isVoice: true
        });
        this.messageText = '';
      },
      (error) => {
        console.error('Voice input error:', error);
        this.isListening = false;
      }
    );
  }

  onQuickReaction(emoji: string) {
    this.reactionSent.emit(emoji);
  }

  onExit() {
    this.exitRemote.emit();
  }
}

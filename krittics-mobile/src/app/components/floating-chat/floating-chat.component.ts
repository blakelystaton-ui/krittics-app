import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatMessage } from '../../services/firebase.service';

interface AnimatedMessage extends ChatMessage {
  animationState: 'enter' | 'floating' | 'exit';
}

@Component({
  selector: 'app-floating-chat',
  templateUrl: './floating-chat.component.html',
  styleUrls: ['./floating-chat.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  animations: [
    trigger('floatUp', [
      state('enter', style({
        opacity: 0,
        transform: 'translateY(0px)'
      })),
      state('floating', style({
        opacity: 1,
        transform: 'translateY(-150px)'
      })),
      state('exit', style({
        opacity: 0,
        transform: 'translateY(-180px)'
      })),
      transition('enter => floating', [
        animate('8000ms ease-out') // 8 seconds continuous float
      ]),
      transition('floating => exit', [
        animate('2000ms ease-in') // 2 seconds fade out
      ])
    ])
  ]
})
export class FloatingChatComponent implements OnChanges {
  @Input() messages: ChatMessage[] = [];
  
  displayedMessages: AnimatedMessage[] = [];
  private messageTimers = new Map<string, any>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages'] && this.messages.length > 0) {
      const newMessages = this.messages.slice(-3); // Show last 3 messages
      
      newMessages.forEach((msg) => {
        // Check if message already displayed
        const exists = this.displayedMessages.find(m => m.id === msg.id);
        if (!exists) {
          this.addMessage(msg);
        }
      });
    }
  }

  private addMessage(message: ChatMessage) {
    const animatedMsg: AnimatedMessage = {
      ...message,
      animationState: 'enter'
    };

    this.displayedMessages.push(animatedMsg);
    this.cdr.detectChanges();

    // Start floating animation
    setTimeout(() => {
      animatedMsg.animationState = 'floating';
      this.cdr.detectChanges();
    }, 100);

    // Start exit animation after 8 seconds
    const exitTimer = setTimeout(() => {
      animatedMsg.animationState = 'exit';
      this.cdr.detectChanges();

      // Remove from DOM after exit animation
      setTimeout(() => {
        const index = this.displayedMessages.indexOf(animatedMsg);
        if (index > -1) {
          this.displayedMessages.splice(index, 1);
          this.cdr.detectChanges();
        }
      }, 2000);
    }, 8000);

    // Store timer for cleanup
    if (message.id) {
      this.messageTimers.set(message.id, exitTimer);
    }
  }

  trackByMessageId(index: number, message: AnimatedMessage): string {
    return message.id || index.toString();
  }

  ngOnDestroy() {
    // Clear all timers
    this.messageTimers.forEach(timer => clearTimeout(timer));
    this.messageTimers.clear();
  }
}

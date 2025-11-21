import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-chat-input-bar',
  templateUrl: './chat-input-bar.component.html',
  styleUrls: ['./chat-input-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ChatInputBarComponent {
  @Output() sendMessage = new EventEmitter<string>();
  
  messageText: string = '';
  keyboardHeight: number = 0;

  constructor() {
    // Handle keyboard show/hide
    Keyboard.addListener('keyboardWillShow', (info) => {
      this.keyboardHeight = info.keyboardHeight;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 0;
    });
  }

  onSend() {
    const trimmed = this.messageText.trim();
    if (trimmed) {
      this.sendMessage.emit(trimmed);
      this.messageText = '';
    }
  }

  ngOnDestroy() {
    Keyboard.removeAllListeners();
  }
}

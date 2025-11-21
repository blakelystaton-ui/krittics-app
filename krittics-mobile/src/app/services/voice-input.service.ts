import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VoiceInputService {
  private recognition: any = null;
  private isListening = false;
  private useNative = false;

  constructor(private platform: Platform) {
    this.initializeRecognition();
  }

  /**
   * Initialize speech recognition (Capacitor native or Web Speech API)
   */
  private async initializeRecognition() {
    // Try Capacitor native first
    if (this.platform.is('capacitor')) {
      try {
        const available = await SpeechRecognition.available();
        if (available) {
          this.useNative = true;
          console.log('Using native Capacitor speech recognition');
          return;
        }
      } catch (error) {
        console.log('Capacitor speech recognition not available, falling back to Web Speech API');
      }
    }

    // Fall back to Web Speech API
    const WebSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (WebSpeechRecognition) {
      this.recognition = new WebSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      console.log('Using Web Speech API');
    }
  }

  /**
   * Check if voice input is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start listening for voice input
   */
  async startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      this.isListening = true;

      if (this.useNative) {
        // Use Capacitor native speech recognition
        await this.startNativeListening(onResult, onError);
      } else if (this.recognition) {
        // Use Web Speech API
        await this.startWebListening(onResult, onError);
      } else {
        this.isListening = false;
        if (onError) onError('Speech recognition not supported on this device');
      }
    } catch (error: any) {
      this.isListening = false;
      console.error('Error starting speech recognition:', error);
      if (onError) onError(error.message || 'Failed to start voice input');
    }
  }

  /**
   * Start native Capacitor speech recognition
   */
  private async startNativeListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      // Request permissions
      const hasPermission = await SpeechRecognition.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Start listening
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 1,
        prompt: 'Speak now...',
        partialResults: false,
        popup: false
      });

      // Listen for results
      SpeechRecognition.addListener('partialResults', (data: any) => {
        if (data.matches && data.matches.length > 0) {
          const transcript = data.matches[0];
          console.log('Voice input (native):', transcript);
          onResult(transcript);
          this.isListening = false;
          SpeechRecognition.stop();
        }
      });

    } catch (error: any) {
      console.error('Native speech recognition error:', error);
      this.isListening = false;
      if (onError) {
        onError(error.message || 'Voice input failed');
      }
    }
  }

  /**
   * Start Web Speech API recognition
   */
  private async startWebListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input (web):', transcript);
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (onError) {
        onError(this.getErrorMessage(event.error));
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
  }

  /**
   * Stop listening
   */
  async stopListening() {
    if (!this.isListening) return;

    try {
      if (this.useNative) {
        await SpeechRecognition.stop();
      } else if (this.recognition) {
        this.recognition.stop();
      }
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      this.isListening = false;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Microphone not available.';
      case 'not-allowed':
        return 'Microphone permission denied.';
      case 'network':
        return 'Network error. Please check your connection.';
      default:
        return 'Voice input failed. Please try again.';
    }
  }

  /**
   * Get current listening state
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

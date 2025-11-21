import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FriendPickerComponent, Friend } from '../../components/friend-picker/friend-picker.component';

@Component({
  selector: 'app-crew-demo',
  templateUrl: './crew-demo.page.html',
  styleUrls: ['./crew-demo.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CrewDemoPage implements OnInit {
  
  constructor(
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    // Auto-open friend picker after a short delay
    setTimeout(() => {
      this.openFriendPicker();
    }, 500);
  }

  async openFriendPicker() {
    const modal = await this.modalController.create({
      component: FriendPickerComponent,
      cssClass: 'friend-picker-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.friends) {
      this.startCrewWatch(data.friends);
    }
  }

  startCrewWatch(selectedFriends: Friend[]) {
    // Generate a unique room code
    const roomCode = 'DEMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Use a sample Blender Foundation movie (Big Buck Bunny)
    const movieUrl = 'https://storage.googleapis.com/krittics-movies/big-buck-bunny.mp4';
    
    console.log('Starting Crew Watch with:', {
      roomCode,
      friends: selectedFriends,
      movieUrl
    });

    // Navigate to crew-watch page
    this.router.navigate(['/crew-watch'], {
      queryParams: {
        roomCode,
        movieUrl
      }
    });
  }

  skipDemo() {
    // Navigate back to home or tabs
    this.router.navigate(['/tabs/home']);
  }
}

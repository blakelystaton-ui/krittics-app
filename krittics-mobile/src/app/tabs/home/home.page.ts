import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FriendPickerComponent, Friend } from '../../components/friend-picker/friend-picker.component';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  
  constructor(
    private modalController: ModalController,
    private router: Router,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {}

  async startCrewWatch() {
    // Open friend picker modal for host to select friends
    const modal = await this.modalController.create({
      component: FriendPickerComponent,
      cssClass: 'friend-picker-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.friends) {
      await this.createPrivateRoom(data.friends);
    }
  }

  async createPrivateRoom(selectedFriends: Friend[]) {
    const user = this.authService.user;
    
    if (!user) {
      console.error('User must be authenticated to create a room');
      return;
    }

    // Generate unique room code
    const roomCode = this.generateRoomCode();
    
    // Use Big Buck Bunny for demo (replace with actual movie selection in production)
    const movieUrl = 'https://storage.googleapis.com/krittics-movies/big-buck-bunny.mp4';
    
    try {
      // Create room in Firebase with access control
      await this.firebaseService.createRoom(roomCode, {
        hostId: user.id,
        hostName: `${user.firstName} ${user.lastName}`,
        movieUrl,
        invitedUsers: selectedFriends.map(f => f.id),
        createdAt: new Date().toISOString(),
        isPrivate: true
      });

      // Navigate to crew-watch page
      this.router.navigate(['/crew-watch'], {
        queryParams: {
          roomCode,
          movieUrl
        }
      });
    } catch (error) {
      console.error('Failed to create private room:', error);
    }
  }

  private generateRoomCode(): string {
    return 'CREW' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

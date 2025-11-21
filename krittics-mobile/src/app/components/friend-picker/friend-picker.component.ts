import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

export interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
}

@Component({
  selector: 'app-friend-picker',
  templateUrl: './friend-picker.component.html',
  styleUrls: ['./friend-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class FriendPickerComponent implements OnInit {
  @Output() friendsSelected = new EventEmitter<Friend[]>();
  
  searchQuery = '';
  selectedFriends: Set<string> = new Set();
  allFriends: Friend[] = [];
  isLoading = true;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadTopFriends();
  }

  loadTopFriends() {
    this.isLoading = true;
    this.apiService.getTopFriends(20).subscribe({
      next: (friends) => {
        this.allFriends = friends.map(f => ({
          id: f.id,
          firstName: f.firstName || '',
          lastName: f.lastName || '',
          email: f.email,
          profileImageUrl: f.profileImageUrl || `https://i.pravatar.cc/150?u=${f.id}`
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading friends:', err);
        this.isLoading = false;
        // Fallback to empty list - user can still use search
        this.allFriends = [];
      }
    });
  }

  searchFriends() {
    if (!this.searchQuery.trim()) {
      this.loadTopFriends();
      return;
    }

    this.isLoading = true;
    this.apiService.searchFriends(this.searchQuery).subscribe({
      next: (friends) => {
        this.allFriends = friends.map(f => ({
          id: f.id,
          firstName: f.firstName || '',
          lastName: f.lastName || '',
          email: f.email,
          profileImageUrl: f.profileImageUrl || `https://i.pravatar.cc/150?u=${f.id}`
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching friends:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredFriends(): Friend[] {
    return this.allFriends;
  }

  onSearchChange() {
    // Debounce search (could add debounce logic here)
    if (this.searchQuery.trim().length >= 2) {
      this.searchFriends();
    } else if (this.searchQuery.trim().length === 0) {
      this.loadTopFriends();
    }
  }

  toggleFriend(friendId: string) {
    if (this.selectedFriends.has(friendId)) {
      this.selectedFriends.delete(friendId);
    } else {
      this.selectedFriends.add(friendId);
    }
  }

  isFriendSelected(friendId: string): boolean {
    return this.selectedFriends.has(friendId);
  }

  startCrewWatch() {
    const selectedFriendsList = this.allFriends.filter(f => 
      this.selectedFriends.has(f.id)
    );
    
    this.modalController.dismiss({
      friends: selectedFriendsList
    });
  }

  cancel() {
    this.modalController.dismiss();
  }
}

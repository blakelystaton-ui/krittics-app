import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonChip, IonLabel, IonGrid, IonRow, IonCol, IonToast } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.page.html',
  styleUrls: ['./interests.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonChip,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonToast
  ]
})
export class InterestsPage implements OnInit {
  movieGenres = environment.movieGenres;
  selectedGenres: Set<string> = new Set();
  showToast = false;
  toastMessage = '';
  isLoading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadExistingInterests();
  }

  loadExistingInterests() {
    this.userService.getUserInterests().subscribe({
      next: (data) => {
        this.selectedGenres = new Set(data.interests);
      },
      error: (err) => {
        console.error('Error loading interests:', err);
      }
    });
  }

  toggleGenre(genre: string) {
    if (this.selectedGenres.has(genre)) {
      this.selectedGenres.delete(genre);
    } else {
      this.selectedGenres.add(genre);
    }
  }

  isSelected(genre: string): boolean {
    return this.selectedGenres.has(genre);
  }

  get hasSelection(): boolean {
    return this.selectedGenres.size > 0;
  }

  async saveInterests() {
    if (!this.hasSelection) {
      this.showToastMessage('Please select at least one genre');
      return;
    }

    this.isLoading = true;
    const interests = Array.from(this.selectedGenres);

    this.userService.updateInterests(interests).subscribe({
      next: () => {
        this.showToastMessage('Interests saved successfully!');
        setTimeout(() => {
          this.router.navigate(['/tabs/tab1']);
        }, 1000);
      },
      error: (err) => {
        console.error('Error saving interests:', err);
        this.showToastMessage('Failed to save interests. Please try again.');
        this.isLoading = false;
      }
    });
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }
}

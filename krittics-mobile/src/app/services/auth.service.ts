import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  interests: string[];
  hasCompletedOnboarding: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.api.get<User>('/auth/user').subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<User>('/auth/user').pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  signOut(): Observable<any> {
    return this.api.post('/auth/signout', {}).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get user(): User | null {
    return this.currentUserSubject.value;
  }
}

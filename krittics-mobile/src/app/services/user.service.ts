import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './auth.service';

export interface CrewMatch extends User {
  sharedInterests: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getUserInterests(): Observable<{ interests: string[] }> {
    return this.api.get<{ interests: string[] }>('/user/interests');
  }

  updateInterests(interests: string[]): Observable<User> {
    return this.api.put<User>('/user/interests', { interests });
  }

  getCrewMatches(): Observable<CrewMatch[]> {
    return this.api.get<CrewMatch[]>('/crew/matches');
  }
}

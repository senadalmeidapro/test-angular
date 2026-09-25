import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { LAB_API_URL } from './lab-api.tokens';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(LAB_API_URL);

  getUsers(): Observable<readonly User[]> {
    return this.http.get<readonly User[]>(`${this.apiUrl}/users`);
  }
}

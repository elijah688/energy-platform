import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { UserWithGenerators } from '../model/user-with-generator';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class Energy {
  public usersWithGenerators = signal<UserWithGenerators[]>([]);
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;



  fetchUsers(limit: number = 100, offset: number = 0) {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    this.http
      .get<UserWithGenerators[]>(`${this.apiUrl}/users-with-generators?${params.toString()}`)
      .subscribe({
        next: users => this.usersWithGenerators.set(users),
        error: err => console.error('Failed to fetch users', err)
      });
  }
}

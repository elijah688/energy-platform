import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { UserWithGenerators } from '../model/user-with-generator';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Energy {
  public usersWithGenerators = signal<UserWithGenerators[]>([]);
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  // Pagination state
  public limit = 3;
  public offset = 0;

  fetchUsers(limit: number = this.limit, offset: number = this.offset) {
    this.limit = limit;
    this.offset = offset;

    const params = new URLSearchParams();
    params.set('limit', this.limit.toString());
    params.set('offset', this.offset.toString());

    this.http
      .get<UserWithGenerators[]>(`${this.apiUrl}/users-with-generators?${params.toString()}`)
      .subscribe({
        next: users => this.usersWithGenerators.set(users),
        error: err => console.error('Failed to fetch users', err)
      });
  }

  next() {
    this.offset += this.limit;
    this.fetchUsers(this.limit, this.offset);
  }

  prev() {
    if (this.offset >= this.limit) {
      this.offset -= this.limit;
      this.fetchUsers(this.limit, this.offset);
    }
  }
}

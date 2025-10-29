import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { UserWithGenerators } from '../model/user-with-generator';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class Energy {
  public usersWithGenerators = signal<UserWithGenerators[]>([]);
  public transactionUsers = signal<UserWithGenerators[]>([]); // selected users for transaction
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
        next: users => {
          // remove any users already selected for transaction
          const filtered = users.filter(u => !this.transactionUsers().includes(u));
          this.usersWithGenerators.set(filtered);
        },
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
  selectUser(user: UserWithGenerators) {
    if (this.transactionUsers().length >= 2) return;

    // Add to transactionUsers
    this.transactionUsers.set([...this.transactionUsers(), user]);

    // Remove from top users list
    this.usersWithGenerators.set(
      this.usersWithGenerators().filter(u => u.user.id !== user.user.id)
    );
  }

  deselectUser(user: UserWithGenerators) {
    // Remove from transactionUsers
    this.transactionUsers.set(
      this.transactionUsers().filter(u => u.user.id !== user.user.id)
    );

    // Prepend back to top list
    this.usersWithGenerators.set([user, ...this.usersWithGenerators()]);
  }
}

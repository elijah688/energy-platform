import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { UserWithGenerators } from '../model/user-with-generator';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Energy {
  public usersWithGenerators = signal<UserWithGenerators[]>([]);
  public transactionUsers = signal<UserWithGenerators[]>([]);

  private userAddedPage = new Map<string, number>(); // userId -> page number
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  public limit = 3;
  public offset = 0;
  public currentPage = 0;

  fetchUsers(limit: number = this.limit, offset: number = this.offset) {
    this.limit = limit;
    this.offset = offset;
    this.currentPage = Math.floor(offset / limit);

    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    this.http
      .get<UserWithGenerators[]>(`${this.apiUrl}/users-with-generators?${params.toString()}`)
      .subscribe({
        next: users => {
          const selectedIds = new Set(this.transactionUsers().map(u => u.user.id));
          const filtered = users.filter(u => !selectedIds.has(u.user.id));
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

    this.transactionUsers.set([...this.transactionUsers(), user]);
    this.usersWithGenerators.set(this.usersWithGenerators().filter(u => u.user.id !== user.user.id));

    // Track the page where the user was selected
    this.userAddedPage.set(user.user.id, this.currentPage);
  }

  deselectUser(user: UserWithGenerators) {
    this.transactionUsers.set(this.transactionUsers().filter(u => u.user.id !== user.user.id));

    const addedPage = this.userAddedPage.get(user.user.id);
    if (addedPage === this.currentPage) {
      this.usersWithGenerators.set([user, ...this.usersWithGenerators()]);
    }

    this.userAddedPage.delete(user.user.id);
  }


  executeTransaction(tx: EnergyTransaction): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/transaction`, tx);
  }



}

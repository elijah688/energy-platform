import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class Energy {
  public users = signal<User[]>([]);
  public selecterUsers = signal<User[]>([]);
  public transactions = signal<Record<string, EnergyTransaction[]>>({});
  public generators = signal<Record<string, Generator[]>>({});

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
      .get<User[]>(`${this.apiUrl}/users?${params.toString()}`)
      .subscribe({
        next: users => {
          const selectedIds = new Set(this.selecterUsers().map(u => u.id));
          const filtered = users.filter(u => !selectedIds.has(u.id));
          this.users.set(filtered);
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

  selectUser(user: User) {
    if (this.selecterUsers().length >= 2) return;

    this.selecterUsers.set([...this.selecterUsers(), user]);
    this.users.set(this.users().filter(u => u.id !== user.id));

    // Track the page where the user was selected
    this.userAddedPage.set(user.id, this.currentPage);
  }

  deselectUser(user: User) {
    this.selecterUsers.set(this.selecterUsers().filter(u => u.id !== user.id));

    const addedPage = this.userAddedPage.get(user.id);
    if (addedPage === this.currentPage) {
      this.users.set([user, ...this.users()]);
    }

    this.userAddedPage.delete(user.id);
  }


  executeTransaction(tx: EnergyTransaction): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/transaction`, tx);
  }



}

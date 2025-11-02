import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, tap, catchError, of, firstValueFrom } from 'rxjs';
import { User } from '../../model/user';
import { UserTransactionsMap } from '../../model/transaction';
import { Api } from '../api';

@Injectable({ providedIn: 'root' })
export class UserService {
  public users = signal<User[]>([]);
  public selecterUsers = signal<User[]>([]);
  public transactions = signal<Record<string, UserTransactionsMap[]>>({});
  public generators = signal<Record<string, Generator[]>>({});
  public searchTerm = signal('');

  private userAddedPage = new Map<string, number>();
  private http = inject(HttpClient);
  private api = inject(Api);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  public limit = 3;
  public currentPage = 0;

  // Compute offset dynamically
  private get offset() {
    return this.currentPage * this.limit;
  }

  fetchOfUsers(): Observable<User[]> {
    const params = new URLSearchParams();
    params.set('limit', this.limit.toString());
    params.set('offset', this.offset.toString());
    params.set('name', this.searchTerm());

    return this.http.get<User[]>(`${this.apiUrl}/users?${params.toString()}`).pipe(
      map(users => {
        const selectedIds = new Set(this.selecterUsers().map(u => u.id));
        return users.filter(u => !selectedIds.has(u.id));
      }),
      tap(filtered => this.users.set(filtered)),
      catchError(err => {
        console.error('Failed to fetch users', err);
        return of([]);
      })
    );
  }

  async fetchUsers() {
    await firstValueFrom(this.fetchOfUsers());
  }

  async next() {
    this.currentPage++;
    await this.fetchUsers();
  }

  async prev() {
    if (this.currentPage > 0) {
      this.currentPage--;
      await this.fetchUsers();
    }
  }

  selectUser(user: User) {
    if (this.selecterUsers().length >= 2) return;

    this.selecterUsers.set([...this.selecterUsers(), user]);
    this.users.set(this.users().filter(u => u.id !== user.id));
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
}

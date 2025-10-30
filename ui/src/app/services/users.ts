import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, tap, catchError, of, firstValueFrom } from 'rxjs';
import { User } from '../model/user';
import { UserTransactionsMap } from '../model/transaction';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  public users = signal<User[]>([]);
  public selecterUsers = signal<User[]>([]);
  public transactions = signal<Record<string, UserTransactionsMap[]>>({});
  public generators = signal<Record<string, Generator[]>>({});

  private userAddedPage = new Map<string, number>(); // userId -> page number
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  public limit = 3;
  public offset = 0;
  public currentPage = 0;

  fetchOfUsers(limit: number = this.limit, offset: number = this.offset): Observable<User[]> {
    this.limit = limit;
    this.offset = offset;
    this.currentPage = Math.floor(offset / limit);

    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    return this.http.get<User[]>(`${this.apiUrl}/users?${params.toString()}`).pipe(
      map(users => {
        const selectedIds = new Set(this.selecterUsers().map(u => u.id));
        return users.filter(u => !selectedIds.has(u.id));
      }),
      tap(filtered => this.users.set(filtered)), // optional side effect
      catchError(err => {
        console.error('Failed to fetch users', err);
        return of([]);
      })
    );
  }
  async fetchUsers(limit: number = this.limit, offset: number = this.offset) {
    await firstValueFrom(this.fetchOfUsers(limit, offset));
  }


  async next() {
    this.offset += this.limit;
    await this.fetchUsers(this.limit, this.offset);

  }

  async prev() {
    if (this.offset >= this.limit) {
      this.offset -= this.limit;
      await this.fetchUsers(this.limit, this.offset);
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



}

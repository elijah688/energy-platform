import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { EnergyTransaction, TransactionResponse, UserTransactionsMap } from '../../model/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  /** Default pagination values */
  private readonly DEFAULT_LIMIT = 1;
  private readonly DEFAULT_OFFSET = 0;

  /** All users' transactions, keyed by userId */
  public transactions = signal<UserTransactionsMap>({});

  /** Per-user pagination state */
  public userPagination = signal<Record<string, { limit: number; offset: number }>>({});

  /** Execute a transaction */
  executeOfTransaction(tx: EnergyTransaction): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/transaction`, tx);
  }

  async executeTransaction(tx: EnergyTransaction): Promise<TransactionResponse> {
    return await firstValueFrom(this.executeOfTransaction(tx));
  }

  /** Fetch transactions for a single user */
  async fetchTransactionsForUser(
    userId: string,
    limit = this.DEFAULT_LIMIT,
    offset = this.DEFAULT_OFFSET
  ): Promise<EnergyTransaction[]> {

    // Save per-user pagination state
    this.userPagination.update(current => ({
      ...current,
      [userId]: { limit, offset }
    }));

    const transactions = await firstValueFrom(
      this.http.get<EnergyTransaction[]>(`${this.apiUrl}/transactions`, {
        params: new HttpParams()
          .set('limit', limit.toString())
          .set('offset', offset.toString())
          .set('userId', userId)
      })
    );

    // Merge into global signal, preserving other users
    this.transactions.update(current => ({
      ...current,
      [userId]: transactions
    }));

    return transactions;
  }

  /** Go to next page for a user */
  async nextPage(userId: string) {
    const state = this.userPagination()[userId] || { limit: this.DEFAULT_LIMIT, offset: this.DEFAULT_OFFSET };
    await this.fetchTransactionsForUser(userId, state.limit, state.offset + state.limit);
  }

  /** Go to previous page for a user */
  async prevPage(userId: string) {
    const state = this.userPagination()[userId] || { limit: this.DEFAULT_LIMIT, offset: this.DEFAULT_OFFSET };
    const newOffset = Math.max(0, state.offset - state.limit);
    await this.fetchTransactionsForUser(userId, state.limit, newOffset);
  }
}

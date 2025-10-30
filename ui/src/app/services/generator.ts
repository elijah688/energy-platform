import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { EnergyGenerator, GeneratorResponse, UserGeneratorsMap } from '../model/generator';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  /** Default pagination values */
  private readonly DEFAULT_LIMIT = 1;
  private readonly DEFAULT_OFFSET = 0;

  /** All users' generators, keyed by userId */
  public generators = signal<UserGeneratorsMap>({});

  /** Per-user pagination state */
  public userPagination = signal<Record<string, { limit: number; offset: number }>>({});

  /** Execute a generator action (if needed) */
  executeOfGenerator(gen: EnergyGenerator): Observable<GeneratorResponse> {
    return this.http.post<GeneratorResponse>(`${this.apiUrl}//generators-by-id`, gen);
  }

  async executeGenerator(gen: EnergyGenerator): Promise<GeneratorResponse> {
    return await firstValueFrom(this.executeOfGenerator(gen));
  }

  /** Fetch generators for a single user */
  async fetchGeneratorsForUser(
    userId: string,
    limit = this.DEFAULT_LIMIT,
    offset = this.DEFAULT_OFFSET
  ): Promise<EnergyGenerator[]> {

    // Save per-user pagination state
    this.userPagination.update(current => ({
      ...current,
      [userId]: { limit, offset }
    }));

    const generators = await firstValueFrom(
      this.http.get<EnergyGenerator[]>(`${this.apiUrl}/generators`, {
        params: new HttpParams()
          .set('limit', limit.toString())
          .set('offset', offset.toString())
          .set('userId', userId)
      })
    );

    // Merge into global signal, preserving other users
    this.generators.update(current => ({
      ...current,
      [userId]: generators
    }));

    return generators;
  }

  /** Go to next page for a user */
  async nextPage(userId: string) {
    const state = this.userPagination()[userId] || { limit: this.DEFAULT_LIMIT, offset: this.DEFAULT_OFFSET };
    await this.fetchGeneratorsForUser(userId, state.limit, state.offset + state.limit);
  }

  /** Go to previous page for a user */
  async prevPage(userId: string) {
    const state = this.userPagination()[userId] || { limit: this.DEFAULT_LIMIT, offset: this.DEFAULT_OFFSET };
    const newOffset = Math.max(0, state.offset - state.limit);
    await this.fetchGeneratorsForUser(userId, state.limit, newOffset);
  }
}

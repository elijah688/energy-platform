import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, } from 'rxjs';
import { UserGeneratorsMap } from '../../model/generator';
import { Api } from '../api';
@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private api = inject(Api);

  public generators = signal<UserGeneratorsMap>({});
  public userPagination = signal<Record<string, { limit: number; offset: number }>>({});

  private readonly DEFAULT_LIMIT = 1;
  private readonly DEFAULT_OFFSET = 0;


  /** Stateful fetch: updates signals and pagination */
  async fetchGeneratorsForUser(
    userId: string,
    limit = this.DEFAULT_LIMIT,
    offset = this.DEFAULT_OFFSET
  ): Promise<UserGeneratorsMap> {

    this.userPagination.update(current => ({
      ...current,
      [userId]: { limit, offset }
    }));

    const generators = await this.api.fetchGeneratorsApi(userId, limit, offset);

    this.generators.update(current => ({
      ...current,
      ...generators
    }));

    return generators;
  }

  async nextPage(userId: string) {
    const state = this.userPagination()[userId] || { limit: this.DEFAULT_LIMIT, offset: this.DEFAULT_OFFSET };
    await this.fetchGeneratorsForUser(userId, state.limit, state.offset + state.limit);
  }

  async prevPage(userId: string) {
    const state = this.userPagination()[userId] || { limit: this.DEFAULT_LIMIT, offset: this.DEFAULT_OFFSET };
    const newOffset = Math.max(0, state.offset - state.limit);
    await this.fetchGeneratorsForUser(userId, state.limit, newOffset);
  }
}

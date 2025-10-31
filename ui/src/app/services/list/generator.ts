import { Injectable, signal, inject } from '@angular/core';
import { UserGenerators } from '../../model/generator';
import { Api } from '../api';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private api = inject(Api);

  public userGenerators = signal<Record<string, UserGenerators>>({});

  async fetchGeneratorsForUser(userId: string): Promise<UserGenerators> {
    try {
      const generators = await this.api.fetchUserGenerators(userId);

      this.userGenerators.update(current => ({
        ...current,
        [userId]: generators
      }));

      return generators;
    } catch (error) {
      console.error(`Error fetching generators for user ${userId}:`, error);

      // Return empty generators on error
      const emptyGenerators: UserGenerators = { generators: [], totalKwh: 0 };
      this.userGenerators.update(current => ({
        ...current,
        [userId]: emptyGenerators
      }));

      return emptyGenerators;
    }
  }

}

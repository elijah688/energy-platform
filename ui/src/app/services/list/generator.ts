import { Injectable, signal, inject } from '@angular/core';
import { UserGenerators } from '../../model/generator';
import { Api } from '../api';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private api = inject(Api);

  public userGenerators = signal<Record<string, UserGenerators>>({});

  async fetchGeneratorsForUser(userId: string): Promise<UserGenerators> {
    try {
      const { user: { id }, generators } = await firstValueFrom(this.api.fetchUserWithGenerators(userId));

      this.userGenerators.update(current => ({
        ...current,
        [id]: generators
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

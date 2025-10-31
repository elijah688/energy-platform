import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable, of } from 'rxjs';
import { UserGenerators, GeneratorType } from '../model/generator';
import { User } from '../model/user';
import { UserWithGenerators } from '../model/userGeneratorManagement';
@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;

  /** Fetch generators for a user */
  fetchUserGenerators(userId: string) {
    return firstValueFrom(
      this.http.get<UserGenerators>(`${this.apiUrl}/usergenerators/${userId}`)
    );
  }

  /** Fetch users by IDs */
  fetchUsersByIdsApi(ids: string[]): Observable<User[]> {
    if (!ids.length) return of([]);
    const params = new URLSearchParams();
    params.set('ids', ids.join(','));
    return this.http.get<User[]>(`${this.apiUrl}/users/by-ids?${params.toString()}`);
  }

  /** Fetch all generator types from backend */
  fetchGeneratorTypes(): Promise<GeneratorType[]> {
    return firstValueFrom(
      this.http.get<GeneratorType[]>(`${this.apiUrl}/generatortypes`)
    );
  }

  upsertUserWithGenerators(data: UserWithGenerators): Promise<{
    success: boolean,
    userId: string,
    totalGenerators: number,
    totalKwh: number
  }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; userId: string; totalGenerators: number; totalKwh: number }>(
        `${this.apiUrl}/users/upsert`,
        data
      )
    );
  }
}

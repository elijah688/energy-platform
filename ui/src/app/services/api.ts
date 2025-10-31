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


  fetchUserWithGenerators(userId: string) {
    return this.http.get<UserWithGenerators>(`${this.apiUrl}/usergenerators/${userId}`)
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

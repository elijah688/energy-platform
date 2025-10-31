import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable, of } from 'rxjs';
import { UserGenerators } from '../model/generator';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})

export class Api {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;


  /** Stateless fetch: just returns the generators for a user */
  fetchUserGenerators(
    userId: string,
  ) {
    return firstValueFrom(
      this.http.get<UserGenerators>(`${this.apiUrl}/usergenerators/${userId}`)
    );
  }

  fetchUsersByIdsApi(ids: string[]): Observable<User[]> {
    if (!ids.length) return of([]);

    const params = new URLSearchParams();
    params.set('ids', ids.join(','));

    return this.http.get<User[]>(`${this.apiUrl}/users/by-ids?${params.toString()}`);
  }

}

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, } from 'rxjs';
import { UserGeneratorsMap } from '../model/generator';

@Injectable({
  providedIn: 'root'
})

export class Api {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;


  /** Stateless fetch: just returns the generators for a user */
  fetchGeneratorsApi(
    userId: string,
    limit: number,
    offset: number,
  ) {
    return firstValueFrom(
      this.http.get<UserGeneratorsMap>(`${this.apiUrl}/generators-by-id`, {
        params: new HttpParams()
          .set('limit', limit.toString())
          .set('offset', offset.toString())
          .set('userId', userId)
      })
    );
  }
}

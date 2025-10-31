import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, } from 'rxjs';
import { UserGeneratorsMap } from '../model/generator';
import { Api } from './api';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class Form {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;
  private api = inject(Api);
  private user = signal<User | null>(null);
  public generators = signal<UserGeneratorsMap>({});



  /** Fetch generators for a single user */
  async fetchGeneratorsForUser(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<UserGeneratorsMap> {
    this.api.fetchGeneratorsApi("id", limit, offset)

    return {};
  }


}

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private http = inject(HttpClient);
  private apiUrl = `http://localhost:${environment.backendPort}`;


  executeTransaction(tx: EnergyTransaction): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/transaction`, tx);
  }



}

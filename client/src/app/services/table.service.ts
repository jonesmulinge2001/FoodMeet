import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Table } from '../models/table.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TableService {
  private baseUrl = `${environment.apiBase}`;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  addTable(restaurantId: string, tableNumber: number, seatsCount: number): Observable<Table> {
    return this.http.post<Table>(
      `${this.baseUrl}/restaurants/${restaurantId}/tables`,
      { tableNumber, seatsCount },
      { headers: this.getAuthHeaders() }
    );
  }

  updateTable(tableId: string, tableNumber: number): Observable<Table> {
    return this.http.patch<Table>(`${this.baseUrl}/restaurants/tables/${tableId}`, { tableNumber }, { headers: this.getAuthHeaders() });
  }

  deleteTable(tableId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/restaurants/tables/${tableId}`, { headers: this.getAuthHeaders() });
  }
}

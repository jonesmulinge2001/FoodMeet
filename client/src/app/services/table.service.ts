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

  // Remove restaurantId parameter
  addTable(tableNumber: number, seatsCount: number): Observable<Table> {
    return this.http.post<Table>(
      // Update endpoint to not include restaurantId
      `${this.baseUrl}/tables`, // Changed from /restaurants/${restaurantId}/tables
      { tableNumber, seatsCount },
      { headers: this.getAuthHeaders() }
    );
  }

  updateTable(tableId: string, tableNumber: number): Observable<Table> {
    return this.http.patch<Table>(
      `${this.baseUrl}/tables/${tableId}`, 
      { tableNumber }, 
      { headers: this.getAuthHeaders() }
    );
  }

  deleteTable(tableId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/tables/${tableId}`, 
      { headers: this.getAuthHeaders() }
    );
  }
  
  // Optionally add method to get all tables
  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(
      `${this.baseUrl}/tables`,
      { headers: this.getAuthHeaders() }
    );
  }
}
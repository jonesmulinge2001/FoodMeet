import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seat } from '../models/seat.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private baseUrl = environment.apiBase;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  // Add a seat to a table
  addSeat(tableId: string, seatNumber: number): Observable<Seat> {
    return this.http.post<Seat>(
      `${this.baseUrl}/tables/${tableId}/seats`,
      { seatNumber },
      { headers: this.getAuthHeaders() }
    );
  }

  // Delete a seat by ID
  deleteSeat(seatId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/tables/seats/${seatId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}

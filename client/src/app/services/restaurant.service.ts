import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private baseUrl = `${environment.apiBase}`;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  getAllRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants`, { headers: this.getAuthHeaders() });
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/restaurants/${id}`, {  headers: this.getAuthHeaders()  });
  }

  createRestaurant(data: { name: string; location?: string }): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/restaurants`, data, {  headers: this.getAuthHeaders()  });
  }

  updateRestaurant(id: string, data: { name?: string; location?: string }): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/restaurants/${id}`, data, {  headers: this.getAuthHeaders()  });
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/restaurants/${id}`, {  headers: this.getAuthHeaders()  });
  }
}

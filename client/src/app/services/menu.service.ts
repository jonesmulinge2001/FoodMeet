import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from '../models/menu-item.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private baseUrl = `${environment.apiBase}`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // -------------------------
  // CREATE MENU ITEM (without restaurantId)
  // -------------------------
  createMenuItem(
    data: {
      name: string;
      description?: string;
      price: number;
      isAvailable: boolean;
    },
    imageFile?: File
  ): Observable<MenuItem> {
    if (imageFile) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price.toString());
      formData.append('isAvailable', data.isAvailable.toString());
      if (data.description) formData.append('description', data.description);
      formData.append('image', imageFile);

      return this.http.post<MenuItem>(
        `${this.baseUrl}/menu`, // Changed: removed /${restaurantId}
        formData,
        { headers: this.getAuthHeaders() }
      );
    } else {
      return this.http.post<MenuItem>(
        `${this.baseUrl}/menu`, // Changed: removed /${restaurantId}
        data,
        { headers: this.getAuthHeaders() }
      );
    }
  }

  // -------------------------
  // UPDATE MENU ITEM
  // -------------------------
  updateMenuItem(
    menuItemId: string,
    data: { name?: string; price?: number; isAvailable?: boolean; description?: string },
    imageFile?: File
  ): Observable<MenuItem> {
    if (imageFile) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable.toString());
      if (data.description) formData.append('description', data.description);
      formData.append('image', imageFile);

      return this.http.patch<MenuItem>(
        `${this.baseUrl}/menu/item/${menuItemId}`,
        formData,
        { headers: this.getAuthHeaders() }
      );
    } else {
      return this.http.patch<MenuItem>(
        `${this.baseUrl}/menu/item/${menuItemId}`,
        data,
        { headers: this.getAuthHeaders() }
      );
    }
  }

  // -------------------------
  // GET MENU ITEMS
  // -------------------------
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menu`, 
    { headers: this.getAuthHeaders() });
  }

  getMenuItem(menuItemId: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(
      `${this.baseUrl}/menu/item/${menuItemId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // -------------------------
  // DELETE MENU ITEM
  // -------------------------
  deleteMenuItem(menuItemId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/menu/item/${menuItemId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // -------------------------
  // UPLOAD IMAGE SEPARATELY
  // -------------------------
  uploadMenuItemImage(menuItemId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ imageUrl: string }>(
      `${this.baseUrl}/menu/item/${menuItemId}/upload`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }
}
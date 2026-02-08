// services/staff-order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class StaffOrderService {
  private apiUrl = environment.apiBase;
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiBase);
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.socket.emit('joinStaffRoom');
    });
  }

  // Staff WebSocket events
  onNewOrder(): Observable<Order> {
    return new Observable<Order>(observer => {
      this.socket.on('order.created', (order: Order) => {
        observer.next(order);
      });
    });
  }

  onOrderConfirmed(): Observable<Order> {
    return new Observable<Order>(observer => {
      this.socket.on('order.confirmed', (order: Order) => {
        observer.next(order);
      });
    });
  }

  onOrderDelivered(): Observable<Order> {
    return new Observable<Order>(observer => {
      this.socket.on('order.delivered', (order: Order) => {
        observer.next(order);
      });
    });
  }

  // API Methods
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/all`);
  }

  getDineInOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/dine-in`);
  }

  getTakeawayOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/takeaway`);
  }

  getDeliveryOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/delivery`);
  }

  confirmOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/confirm`, {});
  }

  deliverOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/deliver`, {});
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
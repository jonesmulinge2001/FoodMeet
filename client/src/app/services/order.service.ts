import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, CreateOrderDto, MenuItem } from '../models/order.model';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService implements OnDestroy {
  private apiUrl = environment.apiBase;
  private socket: Socket;
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);
  public currentOrder$ = this.currentOrderSubject.asObservable();

  private cartItemsSubject = new BehaviorSubject<Array<{ menuItem: MenuItem; quantity: number }>>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiBase);

    this.socket.on('order.confirmed', (order: Order) => this.handleOrderUpdate(order));
    this.socket.on('order.delivered', (order: Order) => this.handleOrderUpdate(order));
  }

  // -------------------------
  // REAL-TIME SOCKETS
  // -------------------------
  joinRestaurantRoom(): void {
    this.socket.emit('joinRestaurant', {}); // No restaurantId needed
  }

  joinOrderRoom(orderId: string): void {
    this.socket.emit('joinOrder', { orderId });
  }

  // -------------------------
  // ORDERS
  // -------------------------
  getRestaurantMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu`);
  }

  createOrder(orderData: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData);
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);
  }

  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`);
  }

  // -------------------------
  // CART OPERATIONS
  // -------------------------
  addToCart(menuItem: MenuItem): void {
    const currentCart = this.cartItemsSubject.value;
    const existingIndex = currentCart.findIndex(item => item.menuItem.id === menuItem.id);
    if (existingIndex > -1) {
      const updated = [...currentCart];
      updated[existingIndex].quantity += 1;
      this.cartItemsSubject.next(updated);
    } else {
      this.cartItemsSubject.next([...currentCart, { menuItem, quantity: 1 }]);
    }
  }

  removeFromCart(menuItemId: string): void {
    this.cartItemsSubject.next(this.cartItemsSubject.value.filter(item => item.menuItem.id !== menuItemId));
  }

  updateCartItemQuantity(menuItemId: string, quantity: number): void {
    const updated = this.cartItemsSubject.value
      .map(item => item.menuItem.id === menuItemId ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0);
    this.cartItemsSubject.next(updated);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  getCartTotal(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }

  getCartItemCount(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  setCurrentOrder(order: Order): void {
    this.currentOrderSubject.next(order);
  }

  private handleOrderUpdate(order: Order): void {
    const current = this.currentOrderSubject.value;
    if (current && current.id === order.id) {
      this.currentOrderSubject.next(order);
    }
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }


// -------------------------
// STAFF METHODS
// -------------------------
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

// Staff WebSocket events
listenForNewOrders(): Observable<Order> {
  return new Observable<Order>(observer => {
    this.socket.on('order.created', (order: Order) => {
      observer.next(order);
    });
  });
}

listenForOrderUpdates(): Observable<Order> {
  return new Observable<Order>(observer => {
    this.socket.on('order.updated', (order: Order) => {
      observer.next(order);
    });
  });
}
}

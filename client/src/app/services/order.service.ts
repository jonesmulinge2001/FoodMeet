import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, CreateOrderDto, OrderStatus, MenuItem } from '../models/order.model';

import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiBase;
  private socket: Socket;
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);
  public currentOrder$ = this.currentOrderSubject.asObservable();

  private cartItemsSubject = new BehaviorSubject<Array<{
    menuItem: MenuItem;
    quantity: number;
  }>>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize Socket.io connection
    this.socket = io(environment.apiBase);
    
    // Listen for order updates
    this.socket.on('order.confirmed', (order: Order) => {
      this.handleOrderUpdate(order);
    });
    
    this.socket.on('order.delivered', (order: Order) => {
      this.handleOrderUpdate(order);
    });
  }

  // Join restaurant room for real-time updates
  joinRestaurantRoom(restaurantId: string): void {
    this.socket.emit('joinRestaurant', { restaurantId });
  }

  // Join order room for real-time updates
  joinOrderRoom(orderId: string): void {
    this.socket.emit('joinOrder', { orderId });
  }

  // Get restaurant menu
getRestaurantMenu(restaurantId: string): Observable<MenuItem[]> {
  return this.http.get<MenuItem[]>(`${this.apiUrl}/menu/${restaurantId}`);
}

  // Create new order
  createOrder(restaurantId: string, orderData: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${restaurantId}`, orderData);
  }

  // Get order by ID
  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);
  }

  // Get customer orders
  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`);
  }

  // Add item to cart
  addToCart(menuItem: MenuItem): void {
    const currentCart = this.cartItemsSubject.value;
    const existingItemIndex = currentCart.findIndex(item => item.menuItem.id === menuItem.id);
    
    if (existingItemIndex > -1) {
      const updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += 1;
      this.cartItemsSubject.next(updatedCart);
    } else {
      this.cartItemsSubject.next([...currentCart, { menuItem, quantity: 1 }]);
    }
  }

  // Remove item from cart
  removeFromCart(menuItemId: string): void {
    const currentCart = this.cartItemsSubject.value;
    const updatedCart = currentCart.filter(item => item.menuItem.id !== menuItemId);
    this.cartItemsSubject.next(updatedCart);
  }

  // Update item quantity in cart
  updateCartItemQuantity(menuItemId: string, quantity: number): void {
    const currentCart = this.cartItemsSubject.value;
    const updatedCart = currentCart.map(item => {
      if (item.menuItem.id === menuItemId) {
        return { ...item, quantity };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    this.cartItemsSubject.next(updatedCart);
  }

  // Clear cart
  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  // Get cart total
  getCartTotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.menuItem.price * item.quantity),
      0
    );
  }

  // Get cart item count
  getCartItemCount(): number {
    return this.cartItemsSubject.value.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }

  // Set current order
  setCurrentOrder(order: Order): void {
    this.currentOrderSubject.next(order);
  }

  // Handle order update from socket
  private handleOrderUpdate(order: Order): void {
    const currentOrder = this.currentOrderSubject.value;
    if (currentOrder && currentOrder.id === order.id) {
      this.currentOrderSubject.next(order);
    }
  }

  // Cleanup
  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
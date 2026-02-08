// components/staff/staff-dashboard/staff-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Order, OrderType, OrderStatus } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { StaffOrderService } from '../../services/staff-order.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  selector: 'app-staff-dashboard',
  templateUrl: './dashboardoverview.component.html',
  styleUrls: ['./dashboardoverview.component.css']
})
export class StaffDashboardComponent implements OnInit, OnDestroy {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Stats
  pendingCount = 0;
  confirmedCount = 0;
  deliveredCount = 0;
  
  // Filters
  selectedOrderType: OrderType | 'ALL' = 'ALL';
  selectedStatus: OrderStatus | 'ALL' = 'ALL';
  searchQuery = '';
  
  isLoading = false;
  autoRefreshEnabled = true;
  
  OrderStatus = OrderStatus;
  OrderType = OrderType;
  
  private subscriptions: Subscription[] = [];
  private autoRefreshSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private staffOrderService: StaffOrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllOrders();
    this.setupWebSocketListeners();
    this.startAutoRefresh();
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.updateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  setupWebSocketListeners(): void {
    // New order created
    const newOrderSub = this.staffOrderService.onNewOrder().subscribe(order => {
      this.snackBar.open(`New ${order.orderType} order received!`, 'Dismiss', { duration: 5000 });
      this.allOrders.unshift(order);
      this.updateStats();
      this.applyFilters();
    });

    // Order confirmed
    const confirmedSub = this.staffOrderService.onOrderConfirmed().subscribe(order => {
      this.updateOrderInList(order);
      this.snackBar.open(`Order #${order.id.slice(-4)} confirmed`, 'Dismiss', { duration: 3000 });
    });

    // Order delivered
    const deliveredSub = this.staffOrderService.onOrderDelivered().subscribe(order => {
      this.updateOrderInList(order);
      this.snackBar.open(`Order #${order.id.slice(-4)} delivered`, 'Dismiss', { duration: 3000 });
    });

    this.subscriptions.push(newOrderSub, confirmedSub, deliveredSub);
  }

  startAutoRefresh(): void {
    if (this.autoRefreshEnabled) {
      this.autoRefreshSubscription = interval(30000) // 30 seconds
        .pipe(switchMap(() => this.orderService.getAllOrders()))
        .subscribe({
          next: (orders) => {
            this.allOrders = orders;
            this.updateStats();
            this.applyFilters();
          },
          error: (error) => {
            console.error('Auto-refresh error:', error);
          }
        });
    }
  }

  stopAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  updateStats(): void {
    this.pendingCount = this.allOrders.filter(o => o.status === OrderStatus.PENDING).length;
    this.confirmedCount = this.allOrders.filter(o => o.status === OrderStatus.CONFIRMED).length;
    this.deliveredCount = this.allOrders.filter(o => o.status === OrderStatus.DELIVERED).length;
  }

  applyFilters(): void {
    this.filteredOrders = this.allOrders.filter(order => {
      // Filter by type
      const typeMatches = this.selectedOrderType === 'ALL' || order.orderType === this.selectedOrderType;
      
      // Filter by status
      const statusMatches = this.selectedStatus === 'ALL' || order.status === this.selectedStatus;
      
      // Filter by search query
      const searchMatches = !this.searchQuery || 
        order.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (order.customerId && order.customerId.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (order.tableNumber && order.tableNumber.toString().includes(this.searchQuery)) ||
        (order.deliveryPhone && order.deliveryPhone.includes(this.searchQuery));
      
      return typeMatches && statusMatches && searchMatches;
    });
    
    // Sort by newest first
    this.filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrdersByType(type: OrderType): Order[] {
    return this.allOrders.filter(order => order.orderType === type);
  }

  confirmOrder(order: Order): void {
    this.staffOrderService.confirmOrder(order.id).subscribe({
      next: (updatedOrder) => {
        this.updateOrderInList(updatedOrder);
        this.snackBar.open('Order confirmed successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error confirming order:', error);
        this.snackBar.open('Failed to confirm order', 'Close', { duration: 3000 });
      }
    });
  }

  deliverOrder(order: Order): void {
    this.staffOrderService.deliverOrder(order.id).subscribe({
      next: (updatedOrder) => {
        this.updateOrderInList(updatedOrder);
        this.snackBar.open('Order marked as delivered!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error delivering order:', error);
        this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
      }
    });
  }

  updateOrderInList(updatedOrder: Order): void {
    const index = this.allOrders.findIndex(order => order.id === updatedOrder.id);
    if (index !== -1) {
      this.allOrders[index] = updatedOrder;
      this.updateStats();
      this.applyFilters();
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'warn';
      case OrderStatus.CONFIRMED: return 'accent';
      case OrderStatus.DELIVERED: return 'primary';
      default: return '';
    }
  }

  getOrderTypeIcon(type: OrderType): string {
    switch (type) {
      case OrderType.DINE_IN: return 'restaurant';
      case OrderType.DELIVERY: return 'delivery_dining';
      case OrderType.TAKEAWAY: return 'takeout_dining';
      default: return 'shopping_bag';
    }
  }

  calculateTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopAutoRefresh();
    this.staffOrderService.disconnect();
  }
}
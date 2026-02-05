import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { OrderType, OrderStatus, MenuItem } from '../../models/order.model';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';

  // Expose enum to template
  OrderType = OrderType;

  // Order details
  orderType: OrderType = OrderType.DINE_IN;
  tableNumber: number | null = null;
  seatNumber: number | null = null;
  deliveryAddress: string = '';
  deliveryPhone: string = '';

  // Cart
  cartItems: Array<{ menuItem: MenuItem; quantity: number }> = [];
  cartTotal: number = 0;
  cartItemCount: number = 0;

  // Current order
  currentOrder: any = null;
  isLoading = false;
  isPlacingOrder = false;
  showCheckout = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    public orderService: OrderService // public for template binding
  ) {}

  ngOnInit(): void {
    // Load menu and join restaurant room
    this.loadMenu();
    this.orderService.joinRestaurantRoom();

    // Subscribe to cart updates
    this.subscriptions.push(
      this.orderService.cartItems$.subscribe(items => {
        this.cartItems = items;
        this.cartTotal = this.orderService.getCartTotal();
        this.cartItemCount = this.orderService.getCartItemCount();
      })
    );

    // Subscribe to current order updates
    this.subscriptions.push(
      this.orderService.currentOrder$.subscribe(order => {
        this.currentOrder = order;
      })
    );
  }

  loadMenu(): void {
    this.isLoading = true;

    this.orderService.getRestaurantMenu().subscribe({
      next: (items) => {
        this.menuItems = items.filter(item => item.isAvailable);
        this.filteredItems = [...this.menuItems];
        this.extractCategories();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading menu:', error);
        this.isLoading = false;
        alert('Failed to load menu. Please try again.');
      }
    });
  }

  extractCategories(): void {
    const categoriesSet = new Set<string>();
    this.menuItems.forEach(item => item.category && categoriesSet.add(item.category));
    this.categories = ['all', ...Array.from(categoriesSet)];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filteredItems = category === 'all'
      ? [...this.menuItems]
      : this.menuItems.filter(item => item.category === category);
  }

  // -------------------------
  // CART OPERATIONS
  // -------------------------
  addToCart(menuItem: MenuItem): void {
    this.orderService.addToCart(menuItem);
  }

  removeFromCart(menuItemId: string): void {
    this.orderService.removeFromCart(menuItemId);
  }

  updateQuantity(menuItemId: string, quantity: number): void {
    this.orderService.updateCartItemQuantity(menuItemId, quantity);
  }

  clearCart(): void {
    this.orderService.clearCart();
  }

  toggleCheckout(): void {
    this.showCheckout = !this.showCheckout;
  }

  // -------------------------
  // ORDER OPERATIONS
  // -------------------------
  setOrderType(type: OrderType): void {
    this.orderType = type;
    if (type === OrderType.DINE_IN) {
      this.deliveryAddress = '';
      this.deliveryPhone = '';
    } else if (type === OrderType.DELIVERY) {
      this.tableNumber = null;
      this.seatNumber = null;
    } else { // TAKEAWAY
      this.tableNumber = null;
      this.seatNumber = null;
      this.deliveryAddress = '';
      this.deliveryPhone = '';
    }
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      alert('Please add items to your cart');
      return;
    }

    if (this.orderType === OrderType.DINE_IN && (!this.tableNumber || !this.seatNumber)) {
      alert('Please enter table and seat number for dine-in');
      return;
    }

    if (this.orderType === OrderType.DELIVERY && (!this.deliveryAddress || !this.deliveryPhone)) {
      alert('Please enter delivery address and phone number');
      return;
    }

    this.isPlacingOrder = true;

    const orderData = {
      orderType: this.orderType,
      items: this.cartItems.map(item => ({ menuItemId: item.menuItem.id, quantity: item.quantity })),
      tableNumber: this.orderType === OrderType.DINE_IN ? this.tableNumber ?? undefined : undefined,
      seatNumber: this.orderType === OrderType.DINE_IN ? this.seatNumber ?? undefined : undefined,
      deliveryAddress: this.orderType === OrderType.DELIVERY ? this.deliveryAddress : undefined,
      deliveryPhone: this.orderType === OrderType.DELIVERY ? this.deliveryPhone : undefined
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.isPlacingOrder = false;
        this.orderService.setCurrentOrder(order);
        this.orderService.joinOrderRoom(order.id);
        this.orderService.clearCart();
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.isPlacingOrder = false;
        alert('Failed to place order. Please try again.');
      }
    });
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

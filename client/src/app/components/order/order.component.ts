import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { OrderType, OrderStatus, MenuItem } from '../../models/order.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  restaurantId: string = '';
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
  cartItems: Array<{ menuItem: MenuItem, quantity: number }> = [];
  cartTotal: number = 0;
  cartItemCount: number = 0;
  
  // Order status
  currentOrder: any = null;
  isLoading = false;
  isPlacingOrder = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  showCheckout = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService // Changed to public for template access
  ) {}

  ngOnInit(): void {
  // Temporary: Hardcode the restaurant ID for testing
  this.restaurantId = '687e5304-cc69-4783-89a7-513a097a709a';
  
  console.log('DEBUG: Using restaurant ID:', this.restaurantId);
  
  if (this.restaurantId) {
    this.loadMenu();
    this.orderService.joinRestaurantRoom(this.restaurantId);
  }

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
    console.log(`DEBUG: Loading menu for restaurant ID: ${this.restaurantId}`);
    console.log(`DEBUG: API URL would be: ${environment.apiBase}/menu/${this.restaurantId}`);
    
    this.orderService.getRestaurantMenu(this.restaurantId).subscribe({
      next: (items) => {
        console.log('DEBUG: Raw API response:', items);
        console.log('DEBUG: Response type:', typeof items);
        console.log('DEBUG: Response length:', items?.length);
        
        if (items && items.length > 0) {
          console.log('DEBUG: First item structure:', items[0]);
          console.log('DEBUG: First item properties:', Object.keys(items[0]));
          console.log('DEBUG: First item isAvailable:', items[0].isAvailable);
        }
        
        this.menuItems = items.filter(item => item.isAvailable);
        console.log('DEBUG: Filtered available items:', this.menuItems.length);
        
        this.filteredItems = [...this.menuItems];
        console.log('DEBUG: Filtered items assigned:', this.filteredItems.length);
        
        this.extractCategories();
        console.log('DEBUG: Categories extracted:', this.categories);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('DEBUG: Error loading menu:', error);
        console.error('DEBUG: Error status:', error.status);
        console.error('DEBUG: Error message:', error.message);
        console.error('DEBUG: Error response:', error.error);
        this.isLoading = false;
        alert('Failed to load menu. Please try again.');
      }
    });
  }

  extractCategories(): void {
    const categoriesSet = new Set<string>();
    this.menuItems.forEach(item => categoriesSet.add(item.category));
    this.categories = ['all', ...Array.from(categoriesSet)];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredItems = [...this.menuItems];
    } else {
      this.filteredItems = this.menuItems.filter(item => item.category === category);
    }
  }

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

  setOrderType(type: OrderType): void {
    this.orderType = type;
    // Reset fields when changing order type
    if (type === OrderType.DINE_IN) {
      this.deliveryAddress = '';
      this.deliveryPhone = '';
    } else if (type === OrderType.DELIVERY) {
      this.tableNumber = null;
      this.seatNumber = null;
    } else if (type === OrderType.TAKEAWAY) {
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

    // Validate based on order type
    if (this.orderType === OrderType.DINE_IN) {
      if (!this.tableNumber || !this.seatNumber) {
        alert('Please enter table and seat number for dine-in');
        return;
      }
    } else if (this.orderType === OrderType.DELIVERY) {
      if (!this.deliveryAddress || !this.deliveryPhone) {
        alert('Please enter delivery address and phone number');
        return;
      }
    }
    this.isPlacingOrder = true;

    const orderData = {
      orderType: this.orderType,
      items: this.cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity
      })),
      tableNumber:
  this.orderType === OrderType.DINE_IN
    ? this.tableNumber ?? undefined
    : undefined,

seatNumber:
  this.orderType === OrderType.DINE_IN
    ? this.seatNumber ?? undefined
    : undefined,
      deliveryAddress: this.orderType === OrderType.DELIVERY ? this.deliveryAddress : undefined,
      deliveryPhone: this.orderType === OrderType.DELIVERY ? this.deliveryPhone : undefined
    };

    console.log('Placing order:', orderData); // For debugging

    this.orderService.createOrder(this.restaurantId, orderData).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
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

  toggleCheckout(): void {
    this.showCheckout = !this.showCheckout;
  }
}
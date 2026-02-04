export enum OrderType {
    DINE_IN = 'DINE_IN',
    DELIVERY = 'DELIVERY',
    TAKEAWAY = 'TAKEAWAY'
  }
  
  export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DELIVERED = 'DELIVERED'
  }
  
  export interface OrderItem {
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    orderId: string;
    name?: string;
    description?: string;
    imageUrl?: string;
  }
  
  export interface Order {
    id: string;
    orderType: OrderType;
    status: OrderStatus;
    totalAmount: number;
    tableNumber?: number;
    seatNumber?: number;
    deliveryAddress?: string | null;
    deliveryPhone?: string | null;
    restaurantId: string;
    customerId?: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
  }
  
  export interface CreateOrderDto {
    orderType: OrderType;
    items: Array<{
      menuItemId: string;
      quantity: number;
    }>;
    tableNumber?: number;
    seatNumber?: number;
    deliveryAddress?: string;
    deliveryPhone?: string;
  }
  
  export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    preparationTime: number;
    isAvailable: boolean;
    tags?: string[]; // e.g., ["vegetarian", "popular", "signature"]
  }
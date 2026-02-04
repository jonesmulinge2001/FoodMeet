export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string | null;
    isAvailable: boolean;
    restaurantId: string;
    createdAt: string;
    updatedAt: string;
  }
  
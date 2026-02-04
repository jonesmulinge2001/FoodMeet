import { Seat } from "./seat.model";

export interface Table {
    id: string;
    tableNumber: number;
    restaurantId: string;
    createdAt: string;
    seats?: Seat[];
  }
  
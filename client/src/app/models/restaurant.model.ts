import { MenuItem } from "./menu-item.model";
import { Seat } from "./seat.model";
import { Table } from "./table.model";

export interface Restaurant {
    id: string;
    name: string;
    location: string | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    tables?: Table[];
    seats?: Seat[];
    menuItems?: MenuItem[];
  }
  
import type { User } from './User';
import type { Menu } from './Menu';
import type { EventMenuItem } from './EventMenuItem'; // New import

export type Event = {
  id: number;
  name: string;
  date: string;
  guestCount: number;
  budget: number;
  foodWasteLbs?: number;
  totalCost?: number;
  totalSales?: number;
  clientName?: string;
  clientContact?: string;
  companyId: number;
  createdByUserId: number;
  createdByUser?: User;
  assignedMenuId?: number | null; // Replaced menus array
  assignedMenu?: Menu;
  eventMenuItems?: EventMenuItem[]; // New specific inventory tracking
};

import type { User } from './User';
import type { Menu } from './Menu'; // You'll need to create this one next!

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
  menus: Menu[];
};
import type { Event } from './Event';
import type { MenuItem } from './MenuItem';

export type Menu = {
  id: number;
  name: string;
  description?: string;
  companyId: number; // ADDED
  events?: Event[];
  menuItems: MenuItem[];
};

import type { Menu } from './Menu';

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  cost: number;
  servingSizeLb: number;
  recommendedPer100Guests: number; // CHANGED
  menuId: number;
  menu?: Menu;
};

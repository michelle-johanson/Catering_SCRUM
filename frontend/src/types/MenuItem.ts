import type { Menu } from './Menu';

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  quantityOrdered: number;
  quantityWasted: number;
  menuId: number;
  menu?: Menu;
};
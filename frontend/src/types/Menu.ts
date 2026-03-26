import type { Event } from './Event';
import type { MenuItem } from './MenuItem'; // We will create this one next!

export type Menu = {
  id: number;
  name: string;
  events?: Event[];
  menuItems: MenuItem[];
};

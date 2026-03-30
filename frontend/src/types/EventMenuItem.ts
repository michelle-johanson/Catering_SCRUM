import type { MenuItem } from './MenuItem';
import type { Event } from './Event';

export type EventMenuItem = {
  id: number;
  eventId: number;
  event?: Event;
  menuItemId: number;
  menuItem?: MenuItem;
  qtyOrdered: number;
  qtyLeftover: number;
};

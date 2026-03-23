// TODO: menuService — API calls for Menu and MenuItem CRUD
//
// All functions follow the same pattern as eventService.ts:
// - Use withAuthHeaders() for all requests
// - Throw on non-ok responses (fetchMenus returns [] on failure)
// - Use API_BASE_URL from import.meta.env.VITE_API_URL ?? '/api'
//
// Backend endpoints (MenusController + MenuItemsController):
//
//   Menus:
//   GET    /api/menus                    → fetchMenus(): Promise<Menu[]>
//   GET    /api/menus/byevent/:eventId   → fetchMenusByEvent(eventId): Promise<Menu[]>
//   POST   /api/menus                    → createMenu(data): Promise<Menu>
//   PUT    /api/menus/:id                → updateMenu(id, data): Promise<void>
//   DELETE /api/menus/:id                → deleteMenu(id): Promise<void>
//
//   MenuItems:
//   POST   /api/menuitems                → createMenuItem(data): Promise<MenuItem>
//   PUT    /api/menuitems/:id            → updateMenuItem(id, data): Promise<void>
//   DELETE /api/menuitems/:id            → deleteMenuItem(id): Promise<void>
//
// CreateMenuRequest shape:
//   { name: string; eventId: number }
//
// CreateMenuItemRequest shape:
//   { name: string; category: string; quantityOrdered: number; quantityWasted: number; menuId: number }
//
// Imports needed:
// import type { Menu } from '../types/Menu';
// import type { MenuItem } from '../types/MenuItem';
// import { withAuthHeaders } from './loginService';

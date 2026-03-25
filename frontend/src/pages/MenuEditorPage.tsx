// TODO: MenuEditorPage — edit a menu and its items, route: /menus/:id/edit
//
// Requirements:
// - Fetch menu by ID on mount (GET /api/menus/:id — backend should include MenuItems)
// - Editable menu name field (inline edit with save button, PUT /api/menus/:id)
// - Editable "Event" association (dropdown of all events, PUT /api/menus/:id)
// - Menu items table: Name, Category, Qty Ordered, Qty Wasted, Actions (edit/delete)
// - "Add Item" button opens inline form row at bottom of table:
//     Fields: Name (required), Category (required), Qty Ordered (required, integer ≥ 1),
//             Qty Wasted (default 0, integer ≥ 0)
//     Submit: createMenuItem() from menuService → append to local state
// - Edit item: click row edit → open same form pre-filled, save → updateMenuItem()
// - Delete item: confirm → deleteMenuItem(id) → remove from local state
// - Back button → /menus
//
// Imports needed:
// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//   fetchMenus, updateMenu,
//   createMenuItem, updateMenuItem, deleteMenuItem
// } from '../api/menuService';
// import { fetchEvents } from '../api/eventService';
// import type { Menu } from '../types/Menu';
// import type { MenuItem } from '../types/MenuItem';

function MenuEditorPage() {
  return <div>MenuEditorPage — TODO</div>;
}

export default MenuEditorPage;

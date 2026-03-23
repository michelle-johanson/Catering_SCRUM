// TODO: MenuPage — menu list, route: /menus
//
// Requirements:
// - Fetch all menus (fetchMenus) and all events (fetchEvents) on mount
// - Group menus by event name; display each group as a section with a heading
// - Per menu row: Menu name (link → /menus/:id/edit), Event name, Item count, Delete button
// - "Create Menu" button opens an inline form:
//     Fields: Menu Name (required), Event (dropdown, required)
//     Submit: createMenu() from menuService → add to local state
// - Delete menu: confirm dialog → deleteMenu(id) → remove from local state
// - Loading, error, and empty states
//
// Imports needed:
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fetchMenus, createMenu, deleteMenu } from '../api/menuService';
// import { fetchEvents } from '../api/eventService';
// import type { Menu } from '../types/Menu';
// import type { Event } from '../types/Event';

function MenuPage() {
  return <div>MenuPage — TODO</div>;
}

export default MenuPage;

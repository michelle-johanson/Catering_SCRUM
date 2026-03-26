import type { Menu } from '../types/Menu';
import type { MenuItem } from '../types/MenuItem';
import { withAuthHeaders } from './loginService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface CreateMenuRequest {
  name: string;
}

export interface UpdateMenuRequest {
  id: number;
  name: string;
}

export interface CreateMenuItemRequest {
  name: string;
  category: string;
  quantityOrdered: number;
  quantityWasted: number;
  menuId: number;
}

export interface UpdateMenuItemRequest extends CreateMenuItemRequest {
  id: number;
}

export const fetchMenus = async (): Promise<Menu[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/menus`, {
      headers: withAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as Menu[];
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return [];
  }
};

export const fetchMenusByEvent = async (
  eventId: number | string
): Promise<Menu[]> => {
  const response = await fetch(`${API_BASE_URL}/menus/byevent/${eventId}`, {
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as Menu[];
};

export const fetchMenuById = async (id: number | string): Promise<Menu> => {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as Menu;
};

export const createMenu = async (data: CreateMenuRequest): Promise<Menu> => {
  const response = await fetch(`${API_BASE_URL}/menus`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as Menu;
};

export const updateMenu = async (
  id: number | string,
  data: UpdateMenuRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const deleteMenu = async (id: number | string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const assignMenuToEvent = async (
  menuId: number | string,
  eventId: number | string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/menus/${menuId}/events/${eventId}`,
    {
      method: 'POST',
      headers: withAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const unassignMenuFromEvent = async (
  menuId: number | string,
  eventId: number | string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/menus/${menuId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: withAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const createMenuItem = async (
  data: CreateMenuItemRequest
): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/menuitems`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as MenuItem;
};

export const updateMenuItem = async (
  id: number | string,
  data: UpdateMenuItemRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menuitems/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const deleteMenuItem = async (id: number | string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/menuitems/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

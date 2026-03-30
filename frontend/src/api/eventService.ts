import type { Event } from '../types/Event';
import { withAuthHeaders, getAuthCompanyId } from './loginService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface CreateEventRequest {
  name: string;
  date: string;
  guestCount: number;
  budget: number;
  foodWasteLbs?: number;
  totalCost?: number;
  totalSales?: number;
  clientName?: string;
  clientContact?: string;
  createdByUserId: number;
  companyId: number;
}

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const companyId = getAuthCompanyId();
    const url = companyId ? `${API_BASE_URL}/events?companyId=${companyId}` : `${API_BASE_URL}/events`;
    const response = await fetch(url, {
      headers: withAuthHeaders(),
    });

    // 2. Check for server errors (like a 404 Not Found or 500 Internal Error)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 3. Convert the JSON string into our TypeScript Event objects
    const data: Event[] = await response.json();

    return data;
  } catch (error) {
    // 4. If the backend is turned off or crashes, catch the error
    // and return an empty array so your React app doesn't explode.
    console.error('Failed to fetch events:', error);
    return [];
  }
};

export const createEvent = async (
  eventData: CreateEventRequest
): Promise<Event> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: withAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Event = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
};

export const fetchEventById = async (id: string | number): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    headers: withAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<Event>;
};

export interface UpdateEventRequest {
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
  assignedMenuId?: number | null;
  createdByUserId: number;
  companyId: number;
}

export const updateEvent = async (
  id: string | number,
  eventData: UpdateEventRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const saveEventInventory = async (
  eventId: number,
  items: { menuItemId: number; qtyOrdered: number; qtyLeftover: number }[]
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/inventory`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(items),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const deleteEvent = async (id: string | number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: withAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to delete event ${id}:`, error);
    throw error;
  }
};

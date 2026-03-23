import type { Event } from '../types/Event';
import { withAuthHeaders } from './loginService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface CreateEventRequest {
  name: string;
  date: string;
  guestCount: number;
  budget: number;
  createdByUserId: number;
}

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    // 1. Call the backend
    // This assumes your .NET controller route for events is /api/events
    const response = await fetch(`${API_BASE_URL}/events`, {
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

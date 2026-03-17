import type { Event } from '../types/Event';
import { withAuthHeaders } from './loginServices';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

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

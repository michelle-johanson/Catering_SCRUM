import type { Event } from './Event'; 

export type User = {
  id: number;
  username: string;
  email: string;
  passwordHash: string; // Remember to remove this if you implement a safe DTO!
  role: string;
  events: Event[];
};
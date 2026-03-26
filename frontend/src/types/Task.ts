// TODO: Add Task type once backend CateringTask model is confirmed
//
// Mirrors backend CateringTask model (backend/CateringAPI/Models/CateringTask.cs)
// Status values must match the strings used in TasksController responses exactly.

import type { Event } from './Event';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'Pending' | 'InProgress' | 'Done';
  dueDate?: string; // ISO 8601 string from backend DateTime?
  companyId: number;
  eventId: number | null;
  event?: Event;
}

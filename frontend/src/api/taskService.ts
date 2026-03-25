// TODO: taskService — API calls for Task CRUD
//
// All functions follow the same pattern as eventService.ts:
// - Use withAuthHeaders() for all requests
// - Throw on non-ok responses (don't swallow errors except in fetchTasks which returns [])
// - Use API_BASE_URL from import.meta.env.VITE_API_URL ?? '/api'
//
// Backend endpoints (TasksController):
//   GET    /api/tasks                    → fetchTasks(): Promise<Task[]>
//   GET    /api/tasks/byevent/:eventId   → fetchTasksByEvent(eventId): Promise<Task[]>
//   POST   /api/tasks                    → createTask(data): Promise<Task>
//   PUT    /api/tasks/:id                → updateTask(id, data): Promise<void>
//   DELETE /api/tasks/:id                → deleteTask(id): Promise<void>
//
// CreateTaskRequest shape:
//   { title: string; description?: string; status: string; dueDate?: string; eventId: number }
//
// Imports needed:
// import type { Task } from '../types/Task';
// import { withAuthHeaders } from './loginService';

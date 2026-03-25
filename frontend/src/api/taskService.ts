import type { Task } from '../types/Task';
import { withAuthHeaders } from './loginService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: 'Pending' | 'InProgress' | 'Done';
  dueDate?: string;
  eventId: number;
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  id: number;
}

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: withAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as Task[];
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
};

export const fetchTasksByEvent = async (
  eventId: number | string
): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks/byevent/${eventId}`, {
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as Task[];
};

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as Task;
};

export const updateTask = async (
  id: number | string,
  data: UpdateTaskRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const deleteTask = async (id: number | string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

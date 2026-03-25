import { withAuthHeaders } from './loginService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/Tasks`, { headers: withAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const fetchTasksByEvent = async (eventId: number) => {
  const response = await fetch(`${API_BASE_URL}/Tasks/byevent/${eventId}`, { headers: withAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch tasks for event');
  return response.json();
};

export const createTask = async (taskData: any) => {
  const response = await fetch(`${API_BASE_URL}/Tasks`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(taskData)
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (id: number, taskData: any) => {
  const response = await fetch(`${API_BASE_URL}/Tasks/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(taskData)
  });
  if (!response.ok) throw new Error('Failed to update task');
};

export const deleteTask = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/Tasks/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete task');
};

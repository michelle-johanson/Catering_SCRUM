import type { User } from './User';
import type { Event } from './Event';
import type { Task } from './Task';

export type Company = {
  id: number;
  name: string;
  users: User[];
  events: Event[];
  tasks: Task[];
};

// TODO: EventDetailPage — single event view, route: /events/:id
//
// Requirements:
// - Fetch event by ID: GET /api/events/:id (backend must include Menus + MenuItems + Tasks)
// - Header: event name, formatted date badge, guest count, budget
// - Back button → /events
// - Edit button → /events/:id/edit
// - Three sections (use tab-style headers from events.css):
//
//   1. Overview — all event fields displayed read-only
//
//   2. Menus — list of menus assigned to this event
//      - Each menu shows name, expandable to reveal its MenuItems table
//        (columns: Item Name, Category, Qty Ordered, Qty Wasted)
//      - "Add Menu" button → opens inline form or navigates to /menus with event pre-selected
//      - Delete menu button per row
//
//   3. Tasks — tasks assigned to this event
//      - Table: Title, Description, Status badge, Due Date, Actions (edit/delete)
//      - "Add Task" button → inline form (title, description, status, due date)
//      - Status values: Pending | InProgress | Done  (use .status-* classes from tasks.css)
//
// Imports needed:
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { fetchTasks, createTask, deleteTask } from '../api/taskService';
// import { fetchMenusByEvent } from '../api/menuService';
// import type { Event } from '../types/Event';
// import type { Task } from '../types/Task';

function EventDetailPage() {
  return <div>EventDetailPage — TODO</div>;
}

export default EventDetailPage;

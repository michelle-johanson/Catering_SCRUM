// TODO: EventsPage — full events list, route: /events
//
// Requirements:
// - "Create Event" button → navigate to /events/new
// - Table of all events: Name (clickable → /events/:id), Date, Guest Count, Budget, Actions
// - Actions per row: Edit (→ /events/:id/edit), Delete (confirm dialog)
// - Loading state, error state, empty state
// - Fetch: fetchEvents() from eventService
// - Delete: deleteEvent(id) from eventService, remove from local state on success
//
// This replaces/merges the existing EventList component.
// EventList.tsx in components/ will be deleted once this is implemented.
//
// Imports needed:
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fetchEvents, deleteEvent } from '../api/eventService';
// import type { Event } from '../types/Event';

function EventsPage() {
  return <div>EventsPage — TODO</div>;
}

export default EventsPage;

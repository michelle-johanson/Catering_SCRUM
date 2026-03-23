// TODO: EditEventPage — edit an existing event, route: /events/:id/edit
//
// Requirements:
// - On mount: fetch event by ID (GET /api/events/:id) and pre-fill all form fields
// - Same form fields as CreateEventPage: Name, Date, Guest Count, Budget
// - Same client-side validation logic as CreateEventPage
// - On submit: PUT /api/events/:id with updated data
// - On success: navigate back to /events/:id (event detail)
// - Cancel button → navigate back to /events/:id without saving
// - "Edit Event" heading instead of "Create Event"
//
// Reuse the same form field structure from CreateEventPage.tsx to stay consistent.
//
// Imports needed:
// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { withAuthHeaders } from '../api/loginService';

function EditEventPage() {
  return <div>EditEventPage — TODO</div>;
}

export default EditEventPage;

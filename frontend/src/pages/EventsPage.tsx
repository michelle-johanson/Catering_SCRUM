import { useState, useEffect } from 'react';
import type { Event } from '../types/Event';
import { deleteEvent, fetchEvents } from '../api/eventService';
import CreateEventModal from '../components/modals/CreateEventModal';

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadEvents(); }, []);

  const handleDeleteEvent = async (id: number, name: string) => {
    const shouldDelete = window.confirm(
      `Delete event "${name}"? This action cannot be undone.`
    );
    if (!shouldDelete) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event.';
      setError(`Could not delete event. ${message}`);
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (e: Event) => {
    setEditingEvent(e);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    void loadEvents();
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Events</h2>
        <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
          + Create Event
        </button>
      </div>

      {isLoading && (
        <div className="alert alert-info mb-4" role="alert">
          Loading events...
        </div>
      )}

      {!isLoading && error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="card p-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Guest Count</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && events.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <p className="empty-state-title">No events yet</p>
                    <p>Events will appear here once added.</p>
                  </div>
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr
                  key={e.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(evt) => {
                    if ((evt.target as HTMLElement).tagName === 'BUTTON') return;
                    window.location.href = `/events/${e.id}`;
                  }}
                >
                  <td>{e.name}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.guestCount}</td>
                  <td>${e.budget.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={(evt) => { evt.stopPropagation(); handleOpenEdit(e); }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={(evt) => { evt.stopPropagation(); void handleDeleteEvent(e.id, e.name); }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingEvent={editingEvent}
      />
    </div>
  );
}

export default EventsPage;

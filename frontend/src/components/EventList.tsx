import { useState, useEffect } from 'react';
import type { Event } from '../types/Event';
import { deleteEvent, fetchEvents } from '../api/eventService';
import { useNavigate, Link } from 'react-router-dom';

function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
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

    void loadEvents();
  }, []);

  const handleDeleteEvent = async (id: number, name: string) => {
    const shouldDelete = window.confirm(
      `Delete event "${name}"? This action cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete event.';
      setError(`Could not delete event. ${message}`);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Events</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/events/new')}
        >
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
                <tr key={e.id}>
                  <td>
                    <Link to={`/events/${e.id}`}>{e.name}</Link>
                  </td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.guestCount}</td>
                  <td>${e.budget.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate(`/events/${e.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-secondary ms-2"
                      onClick={() => void handleDeleteEvent(e.id, e.name)}
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
    </div>
  );
}

export default EventList;

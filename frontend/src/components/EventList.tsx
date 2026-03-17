import { useState, useEffect } from "react";
import type { Event } from "../types/Event";
import { fetchEvents } from "../api/eventService";
import { useNavigate } from "react-router-dom";

function EventList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadEvents = async () => {
            setIsLoading(true);
            setError(null);

            const data = await fetchEvents();

            if (data.length === 0) {
                // If the API failed, fetchEvents() already logged the error.
                // We still want to show an empty state, but we can show a helper message.
                setError("No events found. If you expect events, check that the backend is running and you are logged in.");
            }

            setEvents(data);
            setIsLoading(false);
        };

        void loadEvents();
    }, []);

    return (
        <div>
            <h2 className="section-title">Catering Events</h2>

            <button
                className="btn btn-primary mb-3"
                onClick={() => navigate("/events/new")}
            >
                Create Event
            </button>

            {isLoading && (
                <div className="alert alert-info mb-4" role="alert">
                    Loading events...
                </div>
            )}

            {!isLoading && error && (
                <div className="alert alert-warning mb-4" role="alert">
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
                                    <td>{e.name}</td>
                                    <td>{new Date(e.date).toLocaleDateString()}</td>
                                    <td>{e.guestCount}</td>
                                    <td>${e.budget.toFixed(2)}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => navigate(`/events/edit/${e.id}`)}
                                        >
                                            Edit
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

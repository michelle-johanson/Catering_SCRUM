// This is a placeholder page. It shows a health check to show if the frontend and backend are connected.
import { useState, useEffect } from "react";
import type { Event } from "../types/Event";
// We temporarily don't need fetchEvents while we test the health check
// import { fetchEvents } from "../api/eventService";
import { useNavigate } from "react-router-dom";

function EventList() {
    const [events] = useState<Event[]>([
        {
            id: 1,
            name: "Test Event",
            date: new Date().toISOString(),
            guestCount: 50,
            budget: 1000,
            createdByUserId: 0,
            menus: []
        }
        ]);
    const navigate = useNavigate();
    

    // We are adding a new state just to display Tyler's health check message!
    const [healthStatus, setHealthStatus] = useState<string>("Checking connection to .NET...");
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                // 1. Fetch from the health endpoint instead of the events endpoint
                const response = await fetch('/api/health');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 2. Parse the response
                const data = await response.json();

                // 3. Log it for debugging and update the screen!
                console.log("Backend says:", data);
                setHealthStatus(`Connected successfully! Status: ${data.status}`);
                setIsHealthy(true);

            } catch (error) {
                console.error("Health check failed:", error);
                setHealthStatus("Connection failed. Check the console for CORS or Network errors.");
                setIsHealthy(false);
            }
        };

        testConnection();
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

            <div className={`alert ${isHealthy === null ? 'alert-info' : isHealthy ? 'alert-success' : 'alert-danger'} mb-4`} role="alert">
                <span className={`status-dot ${isHealthy === null ? '' : isHealthy ? 'status-dot--healthy' : 'status-dot--error'}`} />
                <strong>API Status:</strong> {healthStatus}
            </div>

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
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
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

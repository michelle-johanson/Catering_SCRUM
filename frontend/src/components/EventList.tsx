// This is a placeholder page. It shows a health check to show if the frontend and backend are connected.
import { useState, useEffect } from "react";
import type { Event } from "../types/Event";
// We temporarily don't need fetchEvents while we test the health check
// import { fetchEvents } from "../api/eventService";

function EventList() {
    const [events] = useState<Event[]>([]);
    
    // We are adding a new state just to display Tyler's health check message!
    const [healthStatus, setHealthStatus] = useState<string>("Checking connection to .NET...");

    useEffect(() => {
        const testConnection = async () => {
            try {
                // 1. Fetch from the health endpoint instead of the events endpoint
                const response = await fetch('https://localhost:7219/api/health');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 2. Parse the response
                const data = await response.json();
                
                // 3. Log it for debugging and update the screen!
                console.log("Backend says:", data);
                setHealthStatus(`Connected successfully! Status: ${data.status}`);
                
            } catch (error) {
                console.error("Health check failed:", error);
                setHealthStatus("Connection failed. Check the console for CORS or Network errors.");
            }
        };

        testConnection();
    }, []);

    return (
        <div>
            <h2>Catering Events</h2>
            
            {/* A temporary banner so we can visually see if the connection works */}
            <div style={{ 
                padding: "12px", 
                backgroundColor: "#e0f7fa", 
                borderLeft: "4px solid #00acc1", 
                marginBottom: "20px",
                fontFamily: "monospace"
            }}>
                <strong>API Status: </strong> {healthStatus}
            </div>

            <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left" }}>Event Name</th>
                        <th style={{ textAlign: "left" }}>Date</th>
                        <th style={{ textAlign: "left" }}>Guest Count</th>
                        <th style={{ textAlign: "left" }}>Budget</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                                Loading or no events found...
                            </td>
                        </tr>
                    ) : (
                        events.map((e) => (
                            <tr key={e.id}>
                                <td>{e.name}</td>
                                <td>{new Date(e.date).toLocaleDateString()}</td>
                                <td>{e.guestCount}</td>
                                <td>${e.budget.toFixed(2)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default EventList;
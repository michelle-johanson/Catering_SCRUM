import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../api/eventService';
import { fetchTasks } from '../api/taskService';
import { getAuthUsername } from '../api/loginService';
import type { Event } from '../types/Event';
import type { Task } from '../types/Task';
import '../styles/dashboard.css';

function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsData, tasksData] = await Promise.all([
          fetchEvents(),
          fetchTasks().catch(() => []),
        ]);
        setEvents(eventsData);
        setTasks(tasksData);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <div className="alert alert-info">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const now = new Date();
  const username = getAuthUsername() ?? 'there';

  // --- Upcoming events (future, sorted soonest first) ---
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- Past events needing financials ---
  const needsFinancials = events.filter(
    (e) =>
      new Date(e.date) < now &&
      (e.totalSales == null || e.totalCost == null || e.foodWasteLbs == null)
  );

  // --- OKR summary ---
  const eventsWithFinancials = events.filter(
    (e) => e.totalSales != null && e.totalCost != null
  );
  const totalRevenue = eventsWithFinancials.reduce(
    (s, e) => s + (e.totalSales ?? 0),
    0
  );
  const totalCosts = eventsWithFinancials.reduce(
    (s, e) => s + (e.totalCost ?? 0),
    0
  );
  const totalProfit = totalRevenue - totalCosts;
  const avgMargin =
    eventsWithFinancials.length > 0 && totalRevenue > 0
      ? ((totalProfit / totalRevenue) * 100).toFixed(1)
      : null;

  const pastWithWaste = events.filter(
    (e) => new Date(e.date) < now && e.foodWasteLbs != null
  );
  const totalWaste = pastWithWaste.reduce(
    (s, e) => s + (e.foodWasteLbs ?? 0),
    0
  );
  const avgWaste =
    pastWithWaste.length > 0
      ? (totalWaste / pastWithWaste.length).toFixed(1)
      : null;

  const daysUntilNext =
    upcomingEvents.length > 0
      ? Math.ceil(
          (new Date(upcomingEvents[0].date).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Welcome back, {username}</h2>
      </div>

      {/* --- OKR Snapshot --- */}
      <div className="stats-grid">
        <div className="metric-card">
          <span className="metric-label">Avg Profit Margin</span>
          <span
            className={`metric-value ${avgMargin != null && Number(avgMargin) >= 0 ? 'text-success' : ''}`}
          >
            {avgMargin != null ? `${avgMargin}%` : '--'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg Food Waste</span>
          <span className="metric-value">
            {avgWaste != null ? `${avgWaste} lbs` : '--'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Upcoming Events</span>
          <span className="metric-value">{upcomingEvents.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Next Event In</span>
          <span className="metric-value">
            {daysUntilNext != null ? `${daysUntilNext} days` : '--'}
          </span>
        </div>
      </div>

      {/* --- Quick Actions --- */}
      <h3 className="section-subtitle">Quick Actions</h3>
      <div className="actions-grid">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/events/new')}
        >
          + Create Event
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/events')}
        >
          View All Events
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/analytics')}
        >
          View Analytics
        </button>
      </div>

      {/* --- Needs Attention --- */}
      {needsFinancials.length > 0 && (
        <>
          <h3 className="section-subtitle">Needs Attention</h3>
          <div className="card p-3 mb-4 needs-attention-card">
            <p
              className="text-muted mb-2"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              These past events are missing post-event financials. Update them
              to improve your analytics.
            </p>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Missing</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {needsFinancials.slice(0, 5).map((e) => {
                    const missing: string[] = [];
                    if (e.totalSales == null) missing.push('Sales');
                    if (e.totalCost == null) missing.push('Cost');
                    if (e.foodWasteLbs == null) missing.push('Waste');
                    return (
                      <tr key={e.id}>
                        <td>{e.name}</td>
                        <td>{new Date(e.date).toLocaleDateString()}</td>
                        <td>{missing.join(', ')}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/events/${e.id}/edit`)}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* --- Upcoming Tasks --- */}
      <h3 className="section-subtitle">Upcoming Tasks</h3>
      <div className="card p-3 mb-4">
        {tasks.length === 0 ? (
          <p className="text-muted mb-0">
            No tasks found. Track what needs to be done by going to the Tasks
            page!
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {tasks
              .filter((t) => t.status !== 'Done')
              .slice(0, 5)
              .map((task) => {
                const ev = events.find((e) => e.id === task.eventId);
                return (
                  <li
                    key={task.id}
                    className="list-group-item d-flex justify-content-between align-items-center px-0"
                  >
                    <div>
                      <strong>{task.title}</strong>
                      {ev && (
                        <span className="text-muted ms-2 px-2 border-start">
                          {ev.name}
                        </span>
                      )}
                    </div>
                    <div className="d-flex align-items-center">
                      {task.dueDate && (
                        <small
                          className={`me-3 ${new Date(task.dueDate) < now ? 'text-danger fw-bold' : 'text-muted'}`}
                        >
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </small>
                      )}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          navigate('/tasks', { state: { editTaskId: task.id } })
                        }
                        title="Manage Task"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      {/* --- Upcoming Events --- */}
      <h3 className="section-subtitle">Upcoming Events</h3>
      <div className="card p-3">
        {upcomingEvents.length === 0 ? (
          <p className="text-muted mb-0">
            No upcoming events. Create one to get started.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.slice(0, 8).map((e) => (
                  <tr
                    key={e.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/events/${e.id}`)}
                  >
                    <td>{e.name}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.guestCount}</td>
                    <td>${e.budget.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;

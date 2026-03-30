import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../api/eventService';
import { fetchTasks } from '../api/taskService';
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

  // --- Upcoming events (future, sorted soonest first) ---
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const remainingUpcoming = upcomingEvents.slice(1, 6); // Grab the next 5 for the table

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

  const daysUntilNext = nextEvent
    ? Math.ceil(
        (new Date(nextEvent.date).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="page-container">
      {/* --- Top Row: KPIs and Actions Side-by-Side --- */}
      <div className="row mb-4" style={{ rowGap: 'var(--space-4)' }}>
        {/* Left: KPIs (Takes up 8/12 columns on large screens) */}
        <div className="col-12 col-lg-8">
          <div className="card p-4 h-100 shadow-sm border-0">
            <h3 className="section-subtitle mt-0 mb-4">
              Key Performance Indicators
            </h3>
            <div className="stats-grid mb-0">
              <div className="metric-card mb-0">
                <span className="metric-label">Avg Profit Margin</span>
                <span
                  className={`metric-value ${avgMargin != null && Number(avgMargin) >= 0 ? 'text-success' : ''}`}
                >
                  {avgMargin != null ? `${avgMargin}%` : '--'}
                </span>
              </div>
              <div className="metric-card mb-0">
                <span className="metric-label">Avg Food Waste</span>
                <span className="metric-value">
                  {avgWaste != null ? `${avgWaste} lbs` : '--'}
                </span>
              </div>
              <div className="metric-card mb-0">
                <span className="metric-label">Total Upcoming</span>
                <span className="metric-value text-primary">
                  {upcomingEvents.length} Events
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions (Takes up 4/12 columns on large screens) */}
        <div className="col-12 col-lg-4">
          <div className="card p-4 h-100 shadow-sm border-0">
            <h3 className="section-subtitle mt-0 mb-4">
              Quick Links
            </h3>
            <div className="d-flex flex-column gap-3">
              <button
                className="btn btn-primary fw-bold w-100"
                onClick={() => navigate('/events')}
              >
                + Create New Event
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate('/menus')}
              >
                Manage Menus
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate('/analytics')}
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- The Spotlight: Next Event --- */}
      {nextEvent && (
        <div
          className="card p-4 mb-4 shadow-sm"
          style={{ borderLeft: '8px solid var(--color-primary)' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="mb-1">Up Next: {nextEvent.name}</h2>
              <div className="text-muted">
                {nextEvent.clientName
                  ? `Client: ${nextEvent.clientName}`
                  : 'No client specified'}
              </div>
            </div>
            <span className="badge bg-primary fs-5 px-3 py-2 rounded-pill">
              {daysUntilNext === 0 ? 'Today!' : `In ${daysUntilNext} Days`}
            </span>
          </div>

          <div className="row bg-light rounded p-3 mb-4 mx-0">
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              <span className="text-muted d-block small text-uppercase fw-bold">
                Date
              </span>
              <span className="fs-5">
                {new Date(nextEvent.date).toLocaleDateString()}
              </span>
            </div>
            <div className="col-6 col-md-4">
              <span className="text-muted d-block small text-uppercase fw-bold">
                Guest Count
              </span>
              <span className="fs-5">{nextEvent.guestCount} People</span>
            </div>
            <div className="col-6 col-md-4">
              <span className="text-muted d-block small text-uppercase fw-bold">
                Budget
              </span>
              <span className="fs-5">
                $
                {nextEvent.budget.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate(`/events/${nextEvent.id}`)}
            >
              Manage Event Details →
            </button>
          </div>
        </div>
      )}

      {/* --- Needs Attention --- */}
      {needsFinancials.length > 0 && (
        <div className="card p-4 mb-4 needs-attention-card shadow-sm border-0">
          <h3 className="section-subtitle mt-0 text-danger">
            Action Required: Missing Financials
          </h3>
          <p className="text-muted mb-3" style={{ fontSize: 'var(--text-sm)' }}>
            These past events are missing post-event data. Update them to ensure
            your Analytics charts are accurate.
          </p>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Missing Data</th>
                  <th className="text-end">Action</th>
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
                      <td className="fw-bold">{e.name}</td>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td className="text-danger">{missing.join(', ')}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => navigate(`/events/${e.id}`)}
                        >
                          Complete Event
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Split Row: Tasks & Remaining Events --- */}
      <div className="row" style={{ rowGap: 'var(--space-4)' }}>
        {/* Left: Upcoming Tasks */}
        <div className="col-12 col-md-6">
          <div className="card p-4 h-100 shadow-sm border-0">
            <h3 className="section-subtitle mt-0 mb-3">Your Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-muted mb-0">
                All caught up! No pending tasks.
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
                        className="list-group-item px-0 border-bottom"
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <strong className="text-primary">{task.title}</strong>
                          {task.dueDate && (
                            <small
                              className={`${new Date(task.dueDate) < now ? 'text-danger fw-bold' : 'text-muted'}`}
                            >
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {ev ? `For: ${ev.name}` : 'General Task'}
                          </small>
                          <button
                            className="btn btn-sm btn-link text-decoration-none p-0"
                            onClick={() =>
                              navigate('/tasks', {
                                state: { editTaskId: task.id },
                              })
                            }
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
        </div>

        {/* Right: Remaining Upcoming Events */}
        <div className="col-12 col-md-6">
          <div className="card p-4 h-100 shadow-sm border-0">
            <h3 className="section-subtitle mt-0 mb-3">Future Events</h3>
            {remainingUpcoming.length === 0 ? (
              <p className="text-muted mb-0">
                No other upcoming events scheduled.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remainingUpcoming.map((e) => (
                      <tr
                        key={e.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/events/${e.id}`)}
                      >
                        <td className="fw-bold">{e.name}</td>
                        <td>{new Date(e.date).toLocaleDateString()}</td>
                        <td>{e.guestCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../api/eventService';
import type { Event } from '../types/Event';
import FoodWasteChart from '../components/dashboard/FoodWasteChart';
import ProfitabilityChart from '../components/dashboard/ProfitabilityChart';
import WasteProfitCorrelation from '../components/dashboard/WasteProfitCorrelation';
import RevenuePerGuestChart from '../components/dashboard/RevenuePerGuestChart';
import CostBreakdownChart from '../components/dashboard/CostBreakdownChart';
import '../styles/dashboard.css';

function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch {
        setError('Failed to load events.');
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

  // --- KPI calculations ---
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= in30Days;
  });
  const pastEvents = events.filter((e) => new Date(e.date) < now);

  const totalBudget = events.reduce((s, e) => s + e.budget, 0);
  const totalRevenue = events.reduce((s, e) => s + (e.totalSales ?? 0), 0);
  const totalCosts = events.reduce((s, e) => s + (e.totalCost ?? 0), 0);
  const totalProfit = totalRevenue - totalCosts;
  const totalWaste = events.reduce((s, e) => s + (e.foodWasteLbs ?? 0), 0);

  const eventsWithFinancials = events.filter(
    (e) => e.totalSales != null && e.totalCost != null
  );
  const avgMargin =
    eventsWithFinancials.length > 0 && totalRevenue > 0
      ? ((totalProfit / totalRevenue) * 100).toFixed(1)
      : null;

  const avgWastePerEvent =
    pastEvents.filter((e) => e.foodWasteLbs != null).length > 0
      ? (
          totalWaste / pastEvents.filter((e) => e.foodWasteLbs != null).length
        ).toFixed(1)
      : null;

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Dashboard</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/events/new')}
          >
            + New Event
          </button>
        </div>
      </div>

      {/* --- Stat Cards --- */}
      <div className="stats-grid">
        <div className="metric-card">
          <span className="metric-label">Total Events</span>
          <span className="metric-value">{events.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Upcoming (30 days)</span>
          <span className="metric-value">{upcomingEvents.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Budget</span>
          <span className="metric-value">${totalBudget.toLocaleString()}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Revenue</span>
          <span className="metric-value">${totalRevenue.toLocaleString()}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Net Profit</span>
          <span
            className={`metric-value ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}
          >
            ${totalProfit.toLocaleString()}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg Profit Margin</span>
          <span className="metric-value">
            {avgMargin != null ? `${avgMargin}%` : '--'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Food Waste</span>
          <span className="metric-value">
            {totalWaste > 0 ? `${totalWaste} lbs` : '--'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg Waste / Event</span>
          <span className="metric-value">
            {avgWastePerEvent != null ? `${avgWastePerEvent} lbs` : '--'}
          </span>
        </div>
      </div>

      {/* --- OKR Charts --- */}
      <h3 className="section-subtitle">Key Results</h3>
      <div className="charts-grid">
        <FoodWasteChart events={events} />
        <ProfitabilityChart events={events} />
      </div>

      <div className="charts-grid">
        <WasteProfitCorrelation events={events} />
        <CostBreakdownChart events={events} />
      </div>

      <div className="charts-grid">
        <RevenuePerGuestChart events={events} />
      </div>

      {/* --- Recent Events Table --- */}
      <h3 className="section-subtitle">Recent Events</h3>
      <div className="card p-3">
        {recentEvents.length === 0 ? (
          <p className="text-muted mb-0">
            No events yet. Create your first event to get started.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Budget</th>
                  <th>Sales</th>
                  <th>Cost</th>
                  <th>Waste</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((e) => (
                  <tr
                    key={e.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/events/${e.id}`)}
                  >
                    <td>{e.name}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.guestCount}</td>
                    <td>${e.budget.toLocaleString()}</td>
                    <td>
                      {e.totalSales != null
                        ? `$${e.totalSales.toLocaleString()}`
                        : '--'}
                    </td>
                    <td>
                      {e.totalCost != null
                        ? `$${e.totalCost.toLocaleString()}`
                        : '--'}
                    </td>
                    <td>
                      {e.foodWasteLbs != null ? `${e.foodWasteLbs} lbs` : '--'}
                    </td>
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

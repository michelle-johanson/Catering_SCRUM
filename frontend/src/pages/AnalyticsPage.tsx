import { useEffect, useState } from 'react';
import { fetchEvents } from '../api/eventService';
import type { Event } from '../types/Event';
import FoodWasteChart from '../components/dashboard/FoodWasteChart';
import ProfitabilityChart from '../components/dashboard/ProfitabilityChart';
import WasteProfitCorrelation from '../components/dashboard/WasteProfitCorrelation';
import RevenuePerGuestChart from '../components/dashboard/RevenuePerGuestChart';
import CostBreakdownChart from '../components/dashboard/CostBreakdownChart';
import '../styles/dashboard.css';

function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch {
        setError('Failed to load event data.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <div className="alert alert-info">Loading analytics...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

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

  const pastWithWaste = events.filter(
    (e) => new Date(e.date) < new Date() && e.foodWasteLbs != null
  );
  const avgWastePerEvent =
    pastWithWaste.length > 0
      ? (totalWaste / pastWithWaste.length).toFixed(1)
      : null;

  return (
    <div>
      <h2 className="section-title">Analytics</h2>

      {/* --- Summary Stats --- */}
      <div className="stats-grid">
        <div className="metric-card">
          <span className="metric-label">Total Revenue</span>
          <span className="metric-value">${totalRevenue.toLocaleString()}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Costs</span>
          <span className="metric-value">${totalCosts.toLocaleString()}</span>
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

      {/* --- Charts --- */}
      <h3 className="section-subtitle">Profitability</h3>
      <div className="charts-grid">
        <ProfitabilityChart events={events} />
        <CostBreakdownChart events={events} />
      </div>

      <h3 className="section-subtitle">Food Waste</h3>
      <div className="charts-grid">
        <FoodWasteChart events={events} />
        <WasteProfitCorrelation events={events} />
      </div>

      <h3 className="section-subtitle">Efficiency</h3>
      <div className="charts-grid">
        <RevenuePerGuestChart events={events} />
      </div>
    </div>
  );
}

export default AnalyticsPage;

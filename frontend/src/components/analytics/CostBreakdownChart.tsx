import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import type { Event } from '../../types/Event';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface Props {
  events: Event[];
}

const COST_ORANGE = 'rgba(180, 105, 14, 0.78)';
const COST_ORANGE_LIGHT = 'rgba(220, 150, 62, 0.78)';
const TARGET_BLUE = 'rgba(54, 95, 134, 0.78)';
const GOOD_GREEN = 'rgba(47, 133, 90, 0.78)';

export default function CostBreakdownChart({ events }: Props) {
  const withFinancials = events.filter(
    (e) => e.totalCost != null && e.totalSales != null
  );

  if (withFinancials.length === 0) {
    return (
      <div className="metric-card">
        <h3 className="metric-label">Cost vs. Revenue Split</h3>
        <p className="text-muted">No financial data yet.</p>
      </div>
    );
  }

  const totalCost = withFinancials.reduce(
    (sum, e) => sum + (e.totalCost ?? 0),
    0
  );
  const totalSales = withFinancials.reduce(
    (sum, e) => sum + (e.totalSales ?? 0),
    0
  );
  const totalProfit = totalSales - totalCost;

  const data = {
    labels:
      totalProfit >= 0
        ? ['Total Costs', 'Total Profit']
        : ['Total Costs', 'Total Loss'],
    datasets: [
      {
        data: [totalCost, Math.abs(totalProfit)],
        backgroundColor:
          totalProfit >= 0
            ? [COST_ORANGE, GOOD_GREEN]
            : [COST_ORANGE_LIGHT, TARGET_BLUE],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="metric-card">
      <h3 className="metric-label">Cost vs. Revenue Split</h3>
      <div style={{ height: 220 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

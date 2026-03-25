import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Event } from '../../types/Event';

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

interface Props {
  events: Event[];
}

export default function WasteProfitCorrelation({ events }: Props) {
  const valid = events.filter(
    (e) => e.foodWasteLbs != null && e.totalSales != null && e.totalCost != null
  );

  const points = valid.map((e) => ({
    x: e.foodWasteLbs ?? 0,
    y: (e.totalSales ?? 0) - (e.totalCost ?? 0),
  }));

  const data = {
    datasets: [
      {
        label: 'Events',
        data: points,
        backgroundColor: 'rgba(74, 94, 58, 0.6)',
        borderColor: '#4a5e3a',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Food Waste vs. Profit Correlation',
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { x: number; y: number } }) =>
            `Waste: ${ctx.parsed.x} lbs, Profit: $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Food Waste (lbs)' },
        beginAtZero: true,
      },
      y: { title: { display: true, text: 'Profit ($)' } },
    },
  };

  if (points.length < 2) {
    return (
      <div className="metric-card">
        <h3 className="metric-label">Food Waste vs. Profit Correlation</h3>
        <p className="text-muted">
          Need at least 2 events with waste and financial data to show
          correlation.
        </p>
      </div>
    );
  }

  return (
    <div className="metric-card">
      <div style={{ height: 300 }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}

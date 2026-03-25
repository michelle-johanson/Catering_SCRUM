import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Event } from '../../types/Event';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  events: Event[];
}

export default function ProfitabilityChart({ events }: Props) {
  const sorted = [...events]
    .filter((e) => e.totalSales != null && e.totalCost != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const margins = sorted.map((e) => {
    const sales = e.totalSales ?? 0;
    const cost = e.totalCost ?? 0;
    return sales > 0 ? Number((((sales - cost) / sales) * 100).toFixed(1)) : 0;
  });

  const data = {
    labels: sorted.map((e) => e.name),
    datasets: [
      {
        label: 'Margin (%)',
        data: margins,
        backgroundColor: margins.map((m) =>
          m >= 0 ? 'rgba(61, 107, 71, 0.7)' : 'rgba(139, 58, 58, 0.7)'
        ),
        borderColor: margins.map((m) => (m >= 0 ? '#3d6b47' : '#8b3a3a')),
        borderWidth: 1,
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
        text: 'Profit Margin by Event',
        font: { size: 14 },
      },
    },
    scales: {
      y: { title: { display: true, text: 'Margin (%)' } },
    },
  };

  if (sorted.length === 0) {
    return (
      <div className="metric-card">
        <h3 className="metric-label">Profit Margin by Event</h3>
        <p className="text-muted">
          No sales/cost data yet. Add post-event financials to see
          profitability.
        </p>
      </div>
    );
  }

  return (
    <div className="metric-card">
      <div style={{ height: 300 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

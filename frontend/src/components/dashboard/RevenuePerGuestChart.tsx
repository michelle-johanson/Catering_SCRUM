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

export default function RevenuePerGuestChart({ events }: Props) {
  const valid = [...events]
    .filter((e) => e.totalSales != null && e.guestCount > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = {
    labels: valid.map((e) => e.name),
    datasets: [
      {
        label: 'Revenue / Guest ($)',
        data: valid.map((e) =>
          Number(((e.totalSales ?? 0) / e.guestCount).toFixed(2))
        ),
        backgroundColor: 'rgba(46, 92, 122, 0.7)',
        borderColor: '#2e5c7a',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Revenue per Guest', font: { size: 14 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: '$ per Guest' } },
    },
  };

  if (valid.length === 0) {
    return (
      <div className="metric-card">
        <h3 className="metric-label">Revenue per Guest</h3>
        <p className="text-muted">No sales data yet.</p>
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

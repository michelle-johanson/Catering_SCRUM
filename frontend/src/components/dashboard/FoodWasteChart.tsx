import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { Event } from '../../types/Event';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  events: Event[];
}

const BAD_ORANGE = '#b4690e';
const BAD_ORANGE_TINT = 'rgba(180, 105, 14, 0.12)';

export default function FoodWasteChart({ events }: Props) {
  const sorted = [...events]
    .filter((e) => e.foodWasteLbs != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = {
    labels: sorted.map((e) => new Date(e.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Food Waste (lbs)',
        data: sorted.map((e) => e.foodWasteLbs ?? 0),
        borderColor: BAD_ORANGE,
        backgroundColor: BAD_ORANGE_TINT,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        text: 'Food Waste Over Time',
        font: { size: 14 },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Pounds (lbs)' } },
      x: { title: { display: true, text: 'Event Date' } },
    },
  };

  if (sorted.length === 0) {
    return (
      <div className="metric-card">
        <h3 className="metric-label">Food Waste Over Time</h3>
        <p className="text-muted">
          No food waste data yet. Add post-event data to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="metric-card">
      <div style={{ height: 300 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

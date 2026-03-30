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

const GOOD_GREEN_RGBA = 'rgba(47, 133, 90, 0.78)';
const GOOD_GREEN = '#2f855a';
const BAD_ORANGE_RGBA = 'rgba(180, 105, 14, 0.78)';
const BAD_ORANGE = '#b4690e';

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
          m >= 0 ? GOOD_GREEN_RGBA : BAD_ORANGE_RGBA
        ),
        borderColor: margins.map((m) => (m >= 0 ? GOOD_GREEN : BAD_ORANGE)),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Profit Margin by Event', font: { size: 14 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Margin (%)' } },
    },
  };

  return (
    <div className="metric-card">
      <h3 className="metric-label">Profit Margin by Event</h3>
      <div style={{ height: 220 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

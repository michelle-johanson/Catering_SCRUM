import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { Event } from '../../types/Event';

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

interface Props {
  events: Event[];
}

const GOOD_GREEN = '#2f855a';
const TARGET_BLUE = '#365f86';
const BAD_ORANGE = '#b4690e';
const WASTE_TARGET_LBS = 20;
const STRONG_PERFORMANCE_WASTE_LBS = 15;

export default function WasteProfitCorrelation({ events }: Props) {
  const valid = events.filter(
    (e) => e.foodWasteLbs != null && e.totalSales != null && e.totalCost != null
  );

  const points = valid.map((e) => ({
    x: e.foodWasteLbs ?? 0,
    y: (e.totalSales ?? 0) - (e.totalCost ?? 0),
  }));

  const highProfitPoints = points.filter(
    (p) => p.y > 0 && p.x <= STRONG_PERFORMANCE_WASTE_LBS
  );
  const onTargetPoints = points.filter(
    (p) =>
      p.y > 0 && p.x > STRONG_PERFORMANCE_WASTE_LBS && p.x <= WASTE_TARGET_LBS
  );
  const highWastePoints = points.filter(
    (p) => p.y <= 0 || p.x > WASTE_TARGET_LBS
  );

  const data = {
    datasets: [
      {
        label: 'High profit',
        data: highProfitPoints,
        backgroundColor: GOOD_GREEN,
        borderColor: GOOD_GREEN,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'On target',
        data: onTargetPoints,
        backgroundColor: TARGET_BLUE,
        borderColor: TARGET_BLUE,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'High waste/loss',
        data: highWastePoints,
        backgroundColor: BAD_ORANGE,
        borderColor: BAD_ORANGE,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: {
        display: true,
        text: 'Food Waste vs. Profit',
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'scatter'>) {
            return `Waste: ${context.parsed.x} lbs, Profit: $${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Food Waste (lbs)' },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: 'Profit ($)' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="metric-card">
      <h3 className="metric-label">Food Waste vs. Profit</h3>
      <div style={{ height: 220 }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}

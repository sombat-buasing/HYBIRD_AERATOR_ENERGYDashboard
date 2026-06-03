import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

import PowerChart
from './components/PowerChart';

function PowerChart({ history }) {
  const data = {
    labels: history.map((x) => new Date(x.created_at).toLocaleTimeString()),

    datasets: [
      {
        label: "Power kW",

        data: history.map((x) => x.power_total),

        tension: 0.3,
      },
    ],
  };

  return <Line data={data} />;
}

export default PowerChart;

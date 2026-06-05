import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

export default function Energy30DaysChart({ data }) {
  const chartData = {
    labels: data.map((d) => new Date(d.log_date).toLocaleDateString("en-GB")),

    datasets: [
      {
        label: "Daily Energy (kWh)",

        data: data.map((d) => Number(d.daily_kwh)),

        backgroundColor: "#2e7d32",
      },
    ],
  };

  const options = {
    responsive: true,

    scales: {
      y: {
        beginAtZero: true,

        title: {
          display: true,
          text: "Energy (kWh)",
        },

        ticks: {
          callback: function (value) {
            return value.toFixed(2);
          },
        },
      },
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",

        formatter: (value) => value.toFixed(3),

        font: {
          weight: "bold",
        },
      },
      elements: {
        bar: {
          borderRadius: 6,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

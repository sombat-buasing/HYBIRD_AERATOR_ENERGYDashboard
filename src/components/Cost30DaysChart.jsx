import { Bar } from "react-chartjs-2";

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
);

export default function Cost30DaysChart({ data }) {
  const chartData = {
    labels: data.map((d) => new Date(d.log_date).toLocaleDateString("en-GB")),

    datasets: [
      {
        label: "Daily Cost (THB)",

        data: data.map((d) => Number(d.daily_cost)),

        backgroundColor: "#ef6c00",
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
          text: "Cost (THB)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

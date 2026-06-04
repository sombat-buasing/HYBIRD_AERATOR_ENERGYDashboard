import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
}
from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function EnergyChart({ history }) {
  const data = {
    labels: history.map((item) =>
      new Date(item.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ),

    datasets: [
      {
        label: "Energy (kWh)",

        data: history.map((item) => Number(item.energy_kwh)),

        borderColor: "#2e7d32",

        backgroundColor: "rgba(46,125,50,0.2)",

        fill: true,

        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        position: "top",
      },
    },

    scales: {
      y: {
        beginAtZero: false,

        title: {
          display: true,
          text: "Energy (kWh)",
        },
      },
    },
  };

  return (
    <div
      style={{
        height: "350px",
      }}
    >
      <Line
        data={data}
        options={{
          ...options,
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
}

export default EnergyChart;

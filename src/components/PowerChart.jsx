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

function PowerChart({ history }) {

  const data = {

    labels: history.map(
      item =>
        new Date(item.created_at)
          .toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit"
            }
          )
    ),

    datasets: [
      {
        label: "Power (kW)",

        data: history.map(
          item => Number(item.power_total)
        ),

        borderColor: "#1976d2",

        backgroundColor:
          "rgba(25,118,210,0.2)",

        fill: true,

        tension: 0.3
      }
    ],
    
  };

  const options = {

    responsive: true,

    plugins: {
      legend: {
        position: "top"
      }
    },

    scales: {

      y: {

        beginAtZero: true,

        title: {
          display: true,
          text: "Power (kW)"
        }
      }
    }
  };

  return (
    <div
      style={{
        height: "350px"
      }}
    >
      <Line
        data={data}
        options={{
          ...options,
          maintainAspectRatio: false
        }}
      />
    </div>
  );
}

export default PowerChart;
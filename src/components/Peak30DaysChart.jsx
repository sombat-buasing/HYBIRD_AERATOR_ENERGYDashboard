import {
  Bar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Peak30DaysChart({
  data
}) {

  const chartData = {

    labels: data.map(
      d =>
        new Date(
          d.log_date
        ).toLocaleDateString("en-GB")
    ),

    datasets: [
      {
        label:
          "Peak Demand (kW)",

        data: data.map(
          d =>
            Number(
              d.peak_kw
            )
        ),

        backgroundColor:
          "#8e24aa"
      }
    ]
  };

  const options = {

    responsive: true,

    scales: {

      y: {

        beginAtZero: true,

        title: {
          display: true,
          text: "Peak Demand (kW)"
        }

      }

    }

  };

  return (
    <Bar
      data={chartData}
      options={options}
    />
  );

}
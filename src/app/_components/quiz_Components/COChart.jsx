import { useEffect, useRef, memo } from "react";
import Chart from "chart.js/auto";

const COChart = ({ questions }) => {
  const chartRef = useRef(null);
  const coCounts = questions.reduce((acc, question) => {
    const co = question.CO || "CO1"; // Default to CO1 if undefined
    acc[co] = (acc[co] || 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(coCounts);
  const data = Object.values(coCounts);
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const chartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Course Outcome Distribution",
            data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    });

    return () => chartInstance.destroy();
  }, [labels, data]);

  return (
    <>
      <h5>CO Distribution</h5>
      <canvas ref={chartRef} />
    </>
  );
};
export default memo(COChart);

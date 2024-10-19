import { useEffect, useRef, useMemo, useState } from "react";
import Chart from "chart.js/auto";

export default function QuizChart({ quizStats }) {
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const subjectChartRef = useRef(null);
  const multiLineChartRef = useRef(null);

  let barChartInstance = useRef(null);
  let lineChartInstance = useRef(null);
  let subjectChartInstance = useRef(null);
  let multiLineChartInstance = useRef(null);

  const [chartWidth, setChartWidth] = useState(0);

  const memoizedData = useMemo(() => {
    if (quizStats && quizStats.data) {
      const userQuizData = quizStats.userQuizData;
      const allQuizData = quizStats.data;

      const quizDates = userQuizData.map((quiz) =>
        new Date(quiz.created_at).toLocaleDateString()
      );
      const quizScores = userQuizData.map((quiz) => quiz.score);
      const subjectNames = [
        ...new Set(userQuizData.map((quiz) => quiz.subject)),
      ];

      // Average score by subject
      const subjectAvgScores = subjectNames.map((subject) => {
        const subjectQuizzes = userQuizData.filter(
          (quiz) => quiz.subject === subject
        );
        const totalScore = subjectQuizzes.reduce(
          (acc, quiz) => acc + quiz.score,
          0
        );
        return totalScore / subjectQuizzes.length;
      });

      // Multi-line chart for all users' scores over time
      const allUsersScores = allQuizData.reduce((acc, quiz) => {
        if (!acc[quiz.roll_no]) acc[quiz.roll_no] = [];
        acc[quiz.roll_no].push(quiz.score);
        return acc;
      }, {});

      // Multi-line chart for all users' scores over time
      const multiLineDatasets = Object.keys(allUsersScores).map((rollNo) => ({
        label: `Roll No. ${rollNo}`,
        data: allUsersScores[rollNo],
        borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        }, 1)`,
        fill: false,
      }));

      return {
        quizDates,
        quizScores,
        subjectNames,
        subjectAvgScores,
        multiLineDatasets,
      };
    }
    return null;
  }, [quizStats]);

  useEffect(() => {
    const updateChartWidth = () => {
      if (window.innerWidth < 768) {
        setChartWidth(window.innerWidth * 0.9); // 90% width on mobile
      } else {
        setChartWidth(window.innerWidth * 0.6); // 60% width on desktop/laptops
      }
    };

    updateChartWidth();
    window.addEventListener("resize", updateChartWidth);

    return () => window.removeEventListener("resize", updateChartWidth);
  }, []);

  useEffect(() => {
    if (memoizedData && quizStats) {
      const {
        quizDates,
        quizScores,
        subjectNames,
        subjectAvgScores,
        multiLineDatasets,
      } = memoizedData;

      destroyPrevInstance(
        barChartInstance,
        lineChartInstance,
        subjectChartInstance,
        multiLineChartInstance
      );

      // Bar chart for score overview
      barChartInstance.current = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: ["Avg Score", "Highest Score", "Lowest Score"],
          datasets: [
            {
              label: "Scores Overview",
              data: [
                quizStats.avgScore,
                quizStats.highestScore,
                quizStats.lowestScore,
              ],
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Line chart for quiz scores over time
      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: quizDates,
          datasets: [
            {
              label: "Quiz Scores Over Time",
              data: quizScores,
              borderColor: "rgb(75, 192, 192)",
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Scores Over Time" },
          },
        },
      });

      // Bar chart for average score by subject
      subjectChartInstance.current = new Chart(subjectChartRef.current, {
        type: "bar",
        data: {
          labels: subjectNames,
          datasets: [
            {
              label: "Average Score by Subject",
              data: subjectAvgScores,
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Average Score by Subject" },
          },
        },
      });

      multiLineChartInstance.current = new Chart(multiLineChartRef.current, {
        type: "line",
        data: {
          labels: quizDates,
          datasets: multiLineDatasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "All Users' Scores Over Time" },
          },
        },
      });
    }

    return () => {
      destroyPrevInstance(
        barChartInstance,
        lineChartInstance,
        subjectChartInstance,
        multiLineChartInstance
      );
    };
  }, [memoizedData, quizStats, chartWidth]);

  return (
    <>
      {quizStats?.userQuizData?.length && (
        <div className="d-flex flex-wrap justify-content-center align-items-center">
          <div style={{ width: `${chartWidth}px`, height: "300px" }}>
            <canvas ref={lineChartRef} />
          </div>

          <div style={{ width: `${chartWidth}px`, height: "300px" }}>
            <canvas ref={barChartRef} />
          </div>

          <div style={{ width: `${chartWidth}px`, height: "300px" }}>
            <canvas ref={subjectChartRef} />
          </div>

          <div style={{ width: `${chartWidth}px`, height: "300px" }}>
            <canvas ref={multiLineChartRef} />
          </div>
        </div>
      )}
    </>
  );
}
function destroyPrevInstance(
  barChartInstance,
  lineChartInstance,
  subjectChartInstance,
  multiLineChartInstance
) {
  if (barChartInstance.current) barChartInstance.current.destroy();
  if (lineChartInstance.current) lineChartInstance.current.destroy();
  if (subjectChartInstance.current) subjectChartInstance.current.destroy();
  if (multiLineChartInstance.current) multiLineChartInstance.current.destroy();
}

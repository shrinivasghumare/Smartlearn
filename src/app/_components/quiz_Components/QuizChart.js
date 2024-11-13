import { useEffect, useRef, useMemo, useState, useCallback,memo } from "react";
import {
  Chart,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";

Chart.register(
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const QuizChart =({ quizStats })=> {
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const subjectChartRef = useRef(null);
  const multiLineChartRef = useRef(null);

  const barChartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  const subjectChartInstance = useRef(null);
  const multiLineChartInstance = useRef(null);

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

      const allUsersScores = allQuizData.reduce((acc, quiz) => {
        if (!acc[quiz.roll_no]) acc[quiz.roll_no] = [];
        acc[quiz.roll_no].push(quiz.score);
        return acc;
      }, {});

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
        setChartWidth(window.innerWidth * 0.9);
      } else {
        setChartWidth(window.innerWidth * 0.6);
      }
    };

    updateChartWidth();

    const resizeListener = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateChartWidth, 200);
    };

    let resizeTimeout = null;
    window.addEventListener("resize", resizeListener);

    return () => {
      window.removeEventListener("resize", resizeListener);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Memoize the chart destruction function
  const destroyPrevInstance = useCallback(() => {
    if (barChartInstance.current) barChartInstance.current.destroy();
    if (lineChartInstance.current) lineChartInstance.current.destroy();
    if (subjectChartInstance.current) subjectChartInstance.current.destroy();
    if (multiLineChartInstance.current)
      multiLineChartInstance.current.destroy();
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

      destroyPrevInstance();

      // Create Bar chart
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

      // Create Line chart
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

      // Create Bar chart for average score by subject
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

      // Create Multi-line chart
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

    return () => destroyPrevInstance();
  }, [memoizedData, quizStats, destroyPrevInstance]);

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
export default memo(QuizChart);
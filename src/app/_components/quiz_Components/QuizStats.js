import {memo} from "react";
const QuizStats = ({ quizStats }) => {
  return (
    <div className="card mt-3 p-3">
      <h5>Quiz Stats</h5>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Total Quizzes</th>
            <td>{quizStats.totalQuizzes}</td>
          </tr>
          <tr>
            <th>Average Score</th>
            <td>{quizStats.avgScore}</td>
          </tr>
          <tr>
            <th>Highest Score</th>
            <td>{quizStats.highestScore}</td>
          </tr>
          <tr>
            <th>Lowest Score</th>
            <td>{quizStats.lowestScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default memo(QuizStats);

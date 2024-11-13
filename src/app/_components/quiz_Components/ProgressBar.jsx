import { memo } from "react";
const ProgressBar = ({ currentQuestionIndex, questions }) => {
  return (
    <div
      className="progress"
      style={{
        height: "10px",
        position: "relative",
        top: "-10px",
      }}
    >
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        style={{
          width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
        }}
      />
    </div>
  );
};
export default memo(ProgressBar);

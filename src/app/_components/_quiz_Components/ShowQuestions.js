export function ShowQuestions({
  currentQuestionIndex,
  handleAnswerChange,
  questions,
  userAnswers,
}) {
  return (
    <div key={currentQuestionIndex} className="mb-4">
      <h5 className="card-title">
        Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}
      </h5>
      <p className="text-muted">
        <span className="badge rounded-pill text-bg-info text-truncate img-fluid">
          {questions[currentQuestionIndex]?.category}
        </span>{" "}
        <span className="badge rounded-pill text-bg-primary text-truncate img-fluid">
          {questions[currentQuestionIndex]?.topic}
        </span>{" "}
        {questions[currentQuestionIndex]?.fromNotes && (
          <span className="badge rounded-pill text-bg-secondary text-truncate img-fluid">
            Notes
          </span>
        )}{" "}
        <span
          className={`badge rounded-pill text-bg-${
            questions[currentQuestionIndex]?.difficulty === "Easy"
              ? "success"
              : questions[currentQuestionIndex]?.difficulty === "Medium"
              ? "warning"
              : "danger"
          } text-truncate img-fluid`}
        >
          {questions[currentQuestionIndex]?.difficulty}
        </span>
      </p>
      <ul className="list-unstyled">
        {questions[currentQuestionIndex]?.options?.map((option, i) => (
          <li key={i} className="mb-2">
            <label className="form-check-label">
              <input
                className="form-check-input me-2"
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={option}
                checked={userAnswers[currentQuestionIndex] === option}
                onChange={() =>
                  handleAnswerChange(currentQuestionIndex, option)
                }
              />
              {option.toString()}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

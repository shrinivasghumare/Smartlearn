export function ShowQuestions({ index, handleAnswerChange, question }) {
  return (
    <div key={index} className="mb-4">
      <h5 className="card-title">
        Q{index + 1}: {question?.question}
      </h5>
      <p className="text-muted">
        <span className="badge rounded-pill text-bg-info text-truncate img-fluid">
          {question?.category}
        </span>{" "}
        <span className="badge rounded-pill text-bg-primary text-truncate img-fluid">
          {question?.topic}
        </span>{" "}
        {question?.fromNotes && (
          <span className="badge rounded-pill text-bg-secondary text-truncate img-fluid">
            Notes
          </span>
        )}{" "}
        <span
          className={`badge rounded-pill text-bg-${
            question?.difficulty === "Easy"
              ? "success"
              : question?.difficulty === "Medium"
              ? "warning"
              : "danger"
          } text-truncate img-fluid`}
        >
          {question?.difficulty}
        </span>
      </p>
      <ul className="list-unstyled">
        {question?.options?.map((option, i) => (
          <li key={i} className="mb-2">
            <label className="form-check-label">
              <input
                className="form-check-input me-2"
                type="radio"
                name={`question-${index}`}
                value={option}
                onChange={() => handleAnswerChange(index, option)}
              />
              {option.toString()}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

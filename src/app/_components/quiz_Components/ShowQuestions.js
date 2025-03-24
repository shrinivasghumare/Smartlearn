import { useEffect } from "react";

export default function ShowQuestions({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  handleSubmit,
  questions,
  userAnswers,
  setUserAnswers,
}) {
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, [currentQuestionIndex]);

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
        {questions[currentQuestionIndex]?.fromPDF && (
          <span className="badge rounded-pill text-bg-secondary text-truncate img-fluid">
            PDF
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
        </span>{" "}
        <span
          className="badge rounded-pill text-bg-light text-truncate img-fluid"
          data-bs-toggle="tooltip"
          title={questions[currentQuestionIndex]?.bloom_taxonomy}
        >
          BL
        </span>{" "}
        {questions[currentQuestionIndex]?.course_outcomes && (
          <span
            className="badge rounded-pill text-bg-light text-truncate img-fluid"
            data-bs-toggle="tooltip"
            title={questions[currentQuestionIndex]?.course_outcomes}
          >
            {questions[currentQuestionIndex].CO}
          </span>
        )}
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
                  setUserAnswers((prevAnswers) => ({
                    ...prevAnswers,
                    [currentQuestionIndex]: option,
                  }))
                }
              />
              {option.toString()}
            </label>
          </li>
        ))}
      </ul>
      <div className="">
        <button
          className="btn btn-dark mx-2"
          onClick={() => {
            if (currentQuestionIndex > 0)
              setCurrentQuestionIndex(currentQuestionIndex - 1);
          }}
          disabled={currentQuestionIndex === 0}
        >
          &larr;
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button className="btn btn-success" onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          <button
            className="btn btn-dark"
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1)
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }}
          >
            &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

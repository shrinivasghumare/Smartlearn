import CheckIcon from "./CheckIcon";
import WrongIcon from "./WrongIcon";
export default function Results({
  score,
  questions,
  userAnswers,
}) {
  return (
    <div>
      <h2 className="text-center text-bg-primary rounded">
        Your Score: {score} out of {questions?.length}
      </h2>
      <hr />
      {questions.map((question, index) => (
        <div key={index} className="mb-4">
          <h5 className="card-title">
            Q{index + 1}: {question?.question}
          </h5>
          <div className="text-muted mb-2">
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
              }  text-truncate img-fluid`}
            >
              {question?.difficulty}
            </span>
            <details>
              <summary className="badge rounded-pill text-bg-dark">
                Explanation
              </summary>
              <p className="bg-body-secondary mt-3 p-3 rounded">{question?.explanation}</p>
            </details>
          </div>
          <ul className="list-unstyled">
            {question?.options.map((option, i) => (
              <li
                key={i}
                className={`mb-2 ${
                  option === question?.correct_answer ? "text-success" : ""
                } ${
                  userAnswers[index] === option &&
                  option !== question?.correct_answer
                    ? "text-danger"
                    : ""
                }`}
              >
                {option.toString()}{" "}
                {userAnswers[index] === option ? (
                  option === question?.correct_answer ? (
                    <CheckIcon />
                  ) : (
                    <WrongIcon />
                  )
                ) : (
                  ""
                )}
              </li>
            ))}
          </ul>
          <hr />
        </div>
      ))}
    </div>
  );
}

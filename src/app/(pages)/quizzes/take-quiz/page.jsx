"use client";
import { useState } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

export default function TakeQuiz() {
  const [quizId, setQuizId] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]); // State for correct answers
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const handleQuizIdChange = (e) => setQuizId(e.target.value);

  const fetchQuiz = async () => {
    if (!quizId) {
      alert("Please enter a quiz ID");
      return;
    }
    setCorrectAnswers([]);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setScore(null);
    setQuiz(null);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();
    if (error) {
      console.error("Error fetching quiz:", error);
      alert("Quiz not found. Please enter a valid quiz ID.");
    } else {
      setQuiz(data);
    }
  };

  const handleOptionSelect = (qIndex, oIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex });
  };

  const handleSubmit = async () => {
    setQuizSubmitted(true);
    if (!quiz) return;

    let calculatedScore = 0;
    let correctAnswersList = []; // Temporary array for correct answers

    quiz.questions.forEach((question, qIndex) => {
      // Check if selected answer is correct
      if (question.correctOptions.includes(selectedAnswers[qIndex])) {
        calculatedScore += 1;
      }
      // Store the correct answers
      correctAnswersList.push(question.correctOptions);
    });

    setScore(calculatedScore);
    setCorrectAnswers(correctAnswersList); // Set correct answers to state

    await supabase
      .from("quiz_results")
      .insert([{ quiz_id: quizId, score: calculatedScore }]);
    alert(
      `Quiz submitted! Your score is: ${calculatedScore}/${quiz.questions.length}`
    );
  };

  return (
    <div className="container mt-5">
      <>
        <form onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-center mb-4">Take a Quiz</h2>
          <div className="input-group mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Quiz ID"
              value={quizId}
              onChange={handleQuizIdChange}
            />
            <button className="btn btn-dark" type="submit" onClick={fetchQuiz}>
              Load Quiz
            </button>
          </div>
        </form>
        <p className="text-center mt-4">
          Please enter a Quiz ID to load the quiz.
        </p>

        {quizSubmitted && (
          <>
            {score !== null && (
              <h2 className="text-center text-bg-primary rounded p-2">
                Your score is: {score} out of {quiz.questions.length}!
              </h2>
            )}
            {correctAnswers.length > 0 && (
              <div className="mt-4">
                <h4>Correct Answers:</h4>
                <ul className="list-group">
                  {quiz.questions.map((question, qIndex) => (
                    <li key={qIndex} className="list-group-item">
                      <strong>{`Question ${qIndex + 1}: ${
                        question.text
                      }`}</strong>
                      <br />
                      <span className="text-success">
                        {`Correct Answer(s): ${question.correctOptions
                          .map(
                            (index) =>
                              `Option ${index + 1}: ${question.options[index]}`
                          )
                          .join(", ")}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </>
      {!quizSubmitted && quiz && (
        <>
          <h3 className="text-center my-3">{quiz.title}</h3>
          <p className="text-muted text-center mb-4">{quiz.description}</p>
          <p className="fw-bold">
            Topics:{" "}
            <span className="text-secondary">
              {quiz.topics
                .toString()
                .split(",")
                .map((topic, idx) => {
                  return (
                    <span
                      key={idx}
                      className="mx-1 rounded-pill badge bg-black"
                    >
                      {topic}
                    </span>
                  );
                })}
            </span>
          </p>

          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 border rounded bg-light">
              <h5>{`Question ${qIndex + 1}: ${question.text}`}</h5>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`question-${qIndex}`}
                    id={`question-${qIndex}-option-${oIndex}`}
                    checked={selectedAnswers[qIndex] === oIndex}
                    onChange={() => handleOptionSelect(qIndex, oIndex)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`question-${qIndex}-option-${oIndex}`}
                  >
                    {`Option ${oIndex + 1}: ${option}`}
                  </label>
                </div>
              ))}
            </div>
          ))}

          <button
            className="btn btn-success w-100 my-4"
            onClick={handleSubmit}
            disabled={quizSubmitted}
          >
            Submit Quiz
          </button>
        </>
      )}
    </div>
  );
}

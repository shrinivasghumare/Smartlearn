import { useState, useMemo } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import { DeleteBtn } from "@/app/_components/quiz_Components/Buttons";

export default function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", ""], correctOptions: [] },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, qIndex) => qIndex !== index));
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleTopicsChange = (e) => setTopics(e.target.value);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].text = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter(
      (_, index) => index !== oIndex
    );
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    const correctOptions = newQuestions[qIndex].correctOptions.includes(oIndex)
      ? newQuestions[qIndex].correctOptions.filter((i) => i !== oIndex)
      : [...newQuestions[qIndex].correctOptions, oIndex];
    newQuestions[qIndex].correctOptions = correctOptions;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert("Add Atleast 1 Question to Continue...");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correctOptions.length === 0) {
        alert(`Question ${i + 1} must have at least one correct option.`);
        return;
      }
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert([{ title, description, topics, questions }])
      .select("id");
    if (error) {
      console.error("Error creating quiz:", error);
    } else {
      alert(`Quiz created! Quiz ID: ${data[0].id}\nCopied to Clipboard!`);
      navigator.clipboard.writeText(data[0].id);
    }
  };

  const renderedQuestions = useMemo(() => {
    return questions.map((q, qIndex) => (
      <div key={qIndex} className="mb-4 p-3 border rounded">
        <input
          type="text"
          className="form-control mb-3"
          placeholder={`Question ${qIndex + 1}`}
          value={q.text}
          onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
          required
        />
        {q.options.map((option, oIndex) => (
          <div key={oIndex} className="input-group mb-3">
            <div className="input-group-text">
              <input
                className="form-check-input mt-0"
                type="checkbox"
                title="Mark as Correct Option!"
                aria-label="Checkbox for correct option"
                checked={q.correctOptions.includes(oIndex)}
                onChange={() => handleCorrectOption(qIndex, oIndex)}
              />
            </div>
            <input
              type="text"
              className="form-control"
              placeholder={`Option ${oIndex + 1}`}
              aria-label="Option text input"
              value={option}
              onChange={(e) =>
                handleOptionChange(qIndex, oIndex, e.target.value)
              }
              required
            />
            <button
              className="btn btn-outline-danger ms-2"
              onClick={() => removeOption(qIndex, oIndex)}
              title="Remove Option"
            >
              <DeleteBtn />
            </button>
          </div>
        ))}
        <button
          className="btn btn-outline-dark m-1"
          onClick={() => addOption(qIndex)}
        >
          Add Option
        </button>
        <button
          className="btn btn-outline-danger m-1"
          onClick={() => removeQuestion(qIndex)}
          title="Delete Question"
        >
          <DeleteBtn />
        </button>
      </div>
    ));
  }, [questions]);
  return (
    <div className="container mt-1">
      <h1 className="text-center mb-4">Create a New Quiz</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Quiz Title"
          value={title}
          onChange={handleTitleChange}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Quiz Description"
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Topics (comma-separated)"
          value={topics}
          onChange={handleTopicsChange}
        />
      </div>
      <form onSubmit={handleSubmit}>
        {renderedQuestions}
        <button className="btn btn-dark m-1" onClick={addQuestion}>
          Add Question
        </button>
        <button className="btn btn-outline-dark m-1" type="submit">
          Create Quiz
        </button>
      </form>
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import curriculumData from "./_data/curriculum.json";
import { ShowQuestions } from "../../_components/_quiz_Components/ShowQuestions";
import { Results } from "../../_components/_quiz_Components/Results";
import { supabase } from "../../_lib/supabaseClient";
import LayoutContext from "../../context/LayoutContext";

// Function to shuffle an array
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function Home() {
  const [semesters, setSemesters] = useState([]); // To store the semesters
  const [selectedSemester, setSelectedSemester] = useState(""); // Selected semester
  const [subjects, setSubjects] = useState([]); // To store the subjects of the selected semester
  const [selectedSubject, setSelectedSubject] = useState(""); // Selected subject
  const [modules, setModules] = useState([]); // Modules of the selected subject
  const [selectedModules, setSelectedModules] = useState([]); // Selected modules
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [professorNotes, setProfessorNotes] = useState("");
  const [quizStats, setQuizStats] = useState(null);
  const { user } = useContext(LayoutContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Fetch quiz history from Supabase when the page loads
  const fetchQuizStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_data")
        .select("*")
        .eq("roll_no", user.roll_no);

      if (error) throw error;

      if (data.length > 0) {
        const totalQuizzes = data.length;
        const totalScore = data.reduce((acc, quiz) => acc + quiz.score, 0);
        const avgScore = (totalScore / totalQuizzes).toFixed(2);
        const highestScore = Math.max(...data.map((quiz) => quiz.score));
        const lowestScore = Math.min(...data.map((quiz) => quiz.score));

        setQuizStats({
          totalQuizzes,
          avgScore,
          highestScore,
          lowestScore,
        });
      } else {
        setQuizStats(null);
      }
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
    }
  }, [user.roll_no]);

  // Load semesters from the curriculum JSON on first render
  useEffect(() => {
    const semesterList = Object.keys(curriculumData.CS);
    setSemesters(semesterList);
    if (user) fetchQuizStats();
  }, [user, fetchQuizStats]);
  // Handle the semester selection and load its subjects
  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    const subjectList = Object.keys(curriculumData.CS[semester].courses).map(
      (subjectKey) => ({
        name: curriculumData.CS[semester].courses[subjectKey].name,
        modules: curriculumData.CS[semester].courses[subjectKey].modules,
      })
    );
    setSubjects(subjectList);
    setSelectedSubject(""); // Clear selected subject
    setModules([]); // Clear modules
    setSelectedModules([]); // Clear selected modules
    setIsAllChecked(false); // Reset check/uncheck state
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    const foundSubject = subjects.find((subj) => subj.name === subject);
    setModules(foundSubject ? foundSubject.modules : []);
    setSelectedModules([]); // Clear selected modules
    setIsAllChecked(false); // Reset "Check All" state

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  };

  const handleModuleChange = (module) => {
    const isSelected = selectedModules.includes(module);
    if (isSelected) {
      setSelectedModules(selectedModules.filter((mod) => mod !== module)); // Deselect
    } else {
      setSelectedModules([...selectedModules, module]); // Select
    }
  };

  const toggleCheckAll = () => {
    if (isAllChecked) {
      setSelectedModules([]);
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    } else {
      setSelectedModules(modules);
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
    }
    setIsAllChecked(!isAllChecked);
  };

  const NumberOfQuestions = 10;
  const getResult = useCallback(async () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    if (!selectedModules.length) {
      alert("Please select at least one module.");
      return;
    }

    const selectedTopics = selectedModules
      .flatMap((mod) => mod.topics)
      .join(", ");
    const prompt = `
    Generate multiple-choice questions (MCQs) based on the following modules, notes, and topics. Each question should include one correct answer and three incorrect answers. The output should be formatted as JSON, containing the following fields:
    [
      {
        "type": "multiple" | "true or false", 
        "difficulty": "Easy" | "Medium" | "Hard", 
        "category": "{subject name}",
        "question": "{the question text}",
        "correct_answer": "{the correct answer}",
        "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
        "explanation": "{a brief explanation about the correct answer}",
        "topic": "{a short topic description}",
        "fromNotes": true | false
      }
    ]
    Modules: ${selectedModules.map((mod) => mod.name).join(", ")}
    Topics: ${selectedTopics}
    Notes: {${professorNotes ? professorNotes : "No notes provided"}}
    Number of questions required: ${NumberOfQuestions}
    `;

    try {
      setLoading(true);
      setShowResults(false);

      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      const cleanedText = rawText
        .replace(/```json\n/g, "")
        .replace(/\\n/g, "")
        .replace(/```/g, "");

      const parsedData = JSON.parse(cleanedText);
      // console.log(parsedData);
      const shuffledQuestions = shuffleArray(parsedData);

      const questionsWithShuffledOptions = shuffledQuestions.map((question) => {
        const allOptions = shuffleArray([
          question.correct_answer,
          ...question.incorrect_answers,
        ]);
        return { ...question, options: allOptions };
      });

      setQuestions(questionsWithShuffledOptions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("There was an error generating the quiz. Please try again later.");
    } finally {
      setUserAnswers({});
      setLoading(false);
    }
  }, [selectedModules, professorNotes]);

  const handleAnswerChange = (index, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [index]: answer,
    }));
  };

  const score = useMemo(() => {
    const correctAnswers = questions.map((q) => q.correct_answer);
    return Object.values(userAnswers).filter(
      (answer, index) => answer === correctAnswers[index]
    ).length;
  }, [userAnswers, questions]);

  const handleSubmit = async () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      alert("Please answer all the questions.");
      return;
    }

    setShowResults(true);

    // Insert the quiz data into Supabase
    const { data, error } = await supabase
      .from("quiz_data")
      .insert([
        {
          modules: [...selectedModules],
          professorNotes: professorNotes,
          numberOfQuestions: NumberOfQuestions,
          questions: [...questions],
          userAnswers: userAnswers,
          subject: selectedSubject,
          semester: selectedSemester,
          score: score,
          roll_no: user.roll_no,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting quiz data:", error);
      return;
    }

    // Re-fetch the stats to reflect the updated data
    fetchQuizStats();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mt-4">
        {/* Left Pane: Inputs */}
        <div className="col-md-4 col-lg-3">
          <div className="card shadow-sm p-4">
            <h4 className="text-center">Configure Quiz</h4>
            <hr />
            <div>
              <label htmlFor="semester" className="form-label">
                Semester:
              </label>
              <select
                className="form-select mb-3"
                value={selectedSemester}
                id="semester"
                onChange={(e) => handleSemesterChange(e.target.value)}
              >
                <option value="" disabled>
                  Select Semester
                </option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>

              {selectedSemester && (
                <>
                  <label htmlFor="subject" className="form-label">
                    Subject:
                  </label>
                  <select
                    className="form-select mb-3"
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Subject
                    </option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  {selectedSubject && (
                    <>
                      <label className="form-label">Modules:</label>
                      {modules.map((module, index) => (
                        <div className="form-check" key={index}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={module.name}
                            checked={selectedModules.includes(module)}
                            onChange={() => handleModuleChange(module)}
                            id={`module-${index}`}
                          />
                          <label
                            className="form-check-label w-100 text-truncate"
                            htmlFor={`module-${index}`}
                          >
                            {module.name}
                          </label>
                        </div>
                      ))}
                      <button
                        className="mt-2 btn btn-sm btn-outline-dark w-100"
                        onClick={toggleCheckAll}
                      >
                        {isAllChecked ? "Uncheck All" : "Check All"}
                      </button>
                      <button
                        className="mt-2 btn btn-dark w-100"
                        onClick={getResult}
                        disabled={
                          loading || !selectedSubject || !selectedModules.length
                        }
                      >
                        {loading ? "Loading..." : "Generate Questions"}
                      </button>
                    </>
                  )}
                </>
              )}

              <label className="form-label mt-3" htmlFor="professorNotes">
                Professor Notes:
              </label>
              <textarea
                className="form-control mb-3"
                id="professorNotes"
                rows="3"
                value={professorNotes}
                onChange={(e) => setProfessorNotes(e.target.value)}
                placeholder="Add your notes here (optional)"
              />

              {quizStats && <QuizStats quizStats={quizStats} />}
            </div>
          </div>
        </div>

        <div className="col-md-8 col-lg-9">
          <div className="card shadow-sm p-4">
            {!questions.length ? (
              <button
                className="btn btn-dark"
                onClick={getResult}
                disabled={
                  loading || !selectedSubject || !selectedModules.length
                }
              >
                {loading ? "Loading..." : "Generate Questions"}
              </button>
            ) : showResults ? (
              <Results
                score={score}
                questions={questions}
                userAnswers={userAnswers}
              />
            ) : (
              <>
                <ShowQuestions
                  currentQuestionIndex={currentQuestionIndex}
                  handleAnswerChange={handleAnswerChange}
                  questions={questions}
                  userAnswers={userAnswers}
                />

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-dark"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button className="btn btn-success" onClick={handleSubmit}>
                      Submit
                    </button>
                  ) : (
                    <button
                      className="btn btn-dark"
                      onClick={handleNextQuestion}
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizStats({ quizStats }) {
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
}

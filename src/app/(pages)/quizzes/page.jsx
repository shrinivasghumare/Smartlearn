"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect, useMemo, useCallback } from "react";
import curriculumData from "./_data/curriculum.json";
import { ShowQuestions } from "../../_components/_quiz_Components/ShowQuestions";
import { Results } from "../../_components/_quiz_Components/Results";

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

  // Load semesters from the curriculum JSON on first render
  useEffect(() => {
    const semesterList = Object.keys(curriculumData.CS);
    setSemesters(semesterList);
  }, []);

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

  // Handle the subject selection and load its modules
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    const foundSubject = subjects.find((subj) => subj.name === subject);
    setModules(foundSubject ? foundSubject.modules : []);
    setSelectedModules([]); // Clear selected modules
    setIsAllChecked(false); // Reset "Check All" state

    // Uncheck all checkboxes on subject change
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  };

  // Handle the module selection
  const handleModuleChange = (module) => {
    const isSelected = selectedModules.includes(module);
    if (isSelected) {
      setSelectedModules(selectedModules.filter((mod) => mod !== module)); // Deselect
    } else {
      setSelectedModules([...selectedModules, module]); // Select
    }
  };

  // Handle the "Check All/Uncheck All" functionality
  const toggleCheckAll = () => {
    if (isAllChecked) {
      // Uncheck all
      setSelectedModules([]);
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    } else {
      // Check all
      setSelectedModules(modules);
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
    }
    setIsAllChecked(!isAllChecked); // Toggle the state
  };

  // Fetch questions based on the selected modules and topics
  const getResult = useCallback(async () => {
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
    Note: If the question is based on the professor's notes, set fromNotes to true. If the question does not relate to the notes or if the notes are irrelevant to the selected subjects or topics, set fromNotes to false.
    Details:

    Modules: ${selectedModules.map((mod) => mod.name).join(", ")}
    Topics: ${selectedTopics}
    Notes: {${professorNotes ? professorNotes : "No notes provided"}}
    Number of questions required: 10
    `;
    // console.log(prompt);
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
      alert("There was an error generating the quiz. Please try again in some minutes!.");
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

  // Handle submission to show results
  const handleSubmit = () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      //alert user to answer all questions
      alert("Please answer all the questions.");
      return;
    }
    setShowResults(true);
  };
  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Quiz Questions</h1>

      {/* Dropdown to select semester */}
      <div className="mb-4">
        <label className="form-label">Select Semester:</label>
        <select
          className="form-select"
          value={selectedSemester}
          onChange={(e) => handleSemesterChange(e.target.value)}
        >
          <option value="" disabled>
            Select a semester
          </option>
          {semesters.map((semester, idx) => (
            <option key={idx} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown to select subject based on semester */}
      {subjects.length > 0 && (
        <div className="mb-4">
          <label className="form-label">Select Subject:</label>
          <select
            className="form-select"
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
          >
            <option value="" disabled>
              Select a subject
            </option>
            {subjects.map((subject, idx) => (
              <option key={idx} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display modules based on selected subject */}
      {modules.length > 0 && (
        <div className="mb-4">
          <label className="form-label">
            Select Modules (You can select multiple):
          </label>
          <button
            className="btn btn-sm btn-outline-dark mx-1"
            onClick={toggleCheckAll}
          >
            {isAllChecked ? "Uncheck All" : "Check All"}
          </button>
          {modules.map((mod, idx) => (
            <div key={idx} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`module-${idx}`}
                onChange={() => handleModuleChange(mod)}
              />
              <label className="form-check-label" htmlFor={`module-${idx}`}>
                <strong>{idx + 1}.</strong> {mod.name}
              </label>
            </div>
          ))}
        </div>
      )}
      {/* Textarea for professor's notes */}
      <div className="mb-4">
        <label className="form-label">Add Notes:</label>
        <textarea
          className="form-control"
          rows="3"
          value={professorNotes}
          onChange={(e) => setProfessorNotes(e.target.value)}
          placeholder="Enter notes provided by your professor here..."
        />
        <small className="form-text text-muted">(Optional)</small>
      </div>
      <div className="text-center mb-4">
        <button
          className="btn btn-dark"
          onClick={getResult}
          disabled={loading || !selectedSubject || selectedModules.length === 0}
        >
          {loading ? "Loading..." : "Generate Questions"}
        </button>
      </div>

      {questions.length > 0 && !showResults && !loading && (
        <div className="card p-4 shadow-sm">
          {questions.map((question, index) => (
            <ShowQuestions
              question={question}
              key={index}
              index={index}
              handleAnswerChange={handleAnswerChange}
            />
          ))}
          <div className="text-center">
            <button className="btn btn-dark" onClick={handleSubmit}>
              Submit Answers
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <Results
          score={score}
          questions={questions}
          userAnswers={userAnswers}
          selectedModules={selectedModules}
          getResult={getResult}
          loading={loading}
          selectedSubject={selectedSubject}
        />
      )}
    </div>
  );
}

"use client";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  lazy,
  Suspense,
} from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@lib/supabaseClient";
import LayoutContext from "@context/LayoutContext";
import { GenerateQuizBtn } from "@quizComponents/Buttons";
import Link from "next/link";
import CreateQuiz from "@/app/_components/quiz_Components/CreateQuiz";
const ShowQuestions = lazy(() => import("@quizComponents/ShowQuestions"));
const Results = lazy(() => import("@quizComponents/Results"));
const QuizConfig = lazy(() => import("@quizComponents/QuizConfig"));
const Loader = lazy(() => import("@components/Loader"));
const QuizStats = lazy(() => import("@quizComponents/QuizStats"));
const QuizChart = lazy(() => import("@quizComponents/QuizChart"));

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
  const [pdfSummary, setPdfSummary] = useState("No pdf file provided!");
  const [file, setFile] = useState(null);
  const [showCreateNewQuiz, setShowCreateNewQuiz] = useState(false);
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [customTopics, setCustomTopics] = useState("");

  const fetchQuizStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("quiz_data").select("*");

      if (error) throw error;
      const userQuizData = data.filter((x) => x.roll_no === user.roll_no);
      if (userQuizData.length > 0) {
        const totalQuizzes = userQuizData.length;
        const totalScore = userQuizData.reduce(
          (acc, quiz) => acc + quiz.score,
          0
        );
        const avgScore = (totalScore / totalQuizzes).toFixed(2);
        const highestScore = Math.max(
          ...userQuizData.map((quiz) => quiz.score)
        );
        const lowestScore = Math.min(...userQuizData.map((quiz) => quiz.score));

        setQuizStats({
          data,
          userQuizData,
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
  }, [user?.roll_no]);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("semester")
          .order("semester", { ascending: true });
        if (error) throw error;
        const uniqueSemesters = [
          ...new Set(data.map((entry) => entry.semester)),
        ];
        setSemesters(uniqueSemesters);
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };

    if (user) {
      fetchSemesters();
      fetchQuizStats();
    }
  }, [user, fetchQuizStats]);

  const handleSemesterChange = async (semester) => {
    setSelectedSemester(semester);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, course_name, course_outcomes")
        .eq("semester", semester);
      if (error) throw error;

      const subjects = data.map((subject) => ({
        id: subject.id,
        name: subject.course_name,
        modules: [], // Will be filled on subject select
        course_outcomes: subject.course_outcomes,
      }));
      setSubjects(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }

    setSelectedSubject(""); // Clear selected subject
    setModules([]); // Clear modules
    setSelectedModules([]); // Clear selected modules
    setIsAllChecked(false); // Reset check/uncheck state
  };

  const handleSubjectChange = async (subject) => {
    setSelectedSubject(subject);
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("id, module_name")
        .eq("course_id", subject.id);
      if (error) throw error;

      setModules(data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
    setSelectedModules([]); // Clear selected modules
    setIsAllChecked(false); // Reset "Check All" state
  };

  const handlePDFSubmit = useCallback(async () => {
    try {
      // console.log(file);
      if (!file) return;
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        // console.log("loaded pdf:", pdf.numPages);

        let text = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          content.items.forEach((item) => {
            text += item.str + " ";
          });
        }
        const prompt = `
            give me a summary of this text!
            ${text}
          `;
        const genAI = new GoogleGenerativeAI(
          process.env.NEXT_PUBLIC_GEMINI_API_KEY
        );
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        setPdfSummary(result.response.text());
        // console.log(result.response.text());
      };
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      console.log(err);
    }
  }, [file]);

  const NumberOfQuestions = 10;
  const getResult = useCallback(async () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    if (!selectedModules.length) {
      alert("Please select at least one module.");
      return;
    }

    const { data: topicsData, error } = await supabase
      .from("topics")
      .select("topic_content")
      .in(
        "module_id",
        selectedModules.map((mod) => mod.id)
      ); // Fetch topics by module IDs

    if (error) {
      console.error("Error fetching topics:", error);
      setLoading(false);
      return;
    }

    const selectedTopics = topicsData
      .map((topic) => topic.topic_content)
      .join(", ");

    handlePDFSubmit();

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
        "fromPDF": true | false
        "bloom_taxonomy": Generate a Bloom's Taxonomy level-based categorization choices:( Remember, Understand, Apply, Analyze, Evaluate, Create ) also consider the difficulty of the problem according to the bloom's taxonomy ("create" being the hardest and "remember" is the lowest )
        "course_outcomes": match one of the outcomes which matches the question, return null if no course outcomes provided.
      }
    ]
    Modules: ${selectedModules.map((mod) => mod.module_name).join(", ")}
    Topics: ${selectedTopics}
    Notes: {${professorNotes ? professorNotes : "No notes provided"}}
    course outcomes: ${
      selectedSubject?.course_outcomes?.map((co) => co).join(",") ||
      "No course outcome provided"
    }
    PDF content: ${pdfSummary}
    Number of questions required: ${NumberOfQuestions}
    `;
    console.log(prompt);
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
      console.log(parsedData);
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
  }, [
    selectedModules,
    professorNotes,
    pdfSummary,
    handlePDFSubmit,
    selectedSubject.course_outcomes,
  ]);

  const handleGenerateFromTopic = async () => {
    if (!customTopics) {
      alert("Please enter at least one topic.");
      return;
    }

    const prompt = `
     Generate multiple-choice questions (MCQs) based on the following topics. Each question should include one correct answer and three incorrect answers. The output should be formatted as JSON, containing the following fields:
    [
      {
        "difficulty": "Easy" | "Medium" | "Hard", 
        "question": "{the question text}",
        "correct_answer": "{the correct answer}",
        "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
        "explanation": "{a brief explanation about the correct answer}",
        "topic": "{a short topic description}",
        "bloom_taxonomy": Generate a Bloom's Taxonomy level-based categorization choices:( Remember, Understand, Apply, Analyze, Evaluate, Create ) also consider the difficulty of the problem according to the bloom's taxonomy ("create" being the hardest and "remember" is the lowest )
      }
    ]
    Topics: ${customTopics}
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
      const parsedData = JSON.parse(
        result.response.text().replace(/```json\n|\\n|```/g, "")
      );
      setQuestions(
        shuffleArray(
          parsedData.map((question) => ({
            ...question,
            options: shuffleArray([
              question.correct_answer,
              ...question.incorrect_answers,
            ]),
          }))
        )
      );
    } catch (error) {
      console.error("Error fetching questions from custom topics:", error);
      alert(
        "There was an error generating the quiz from your topics. Please try again later."
      );
    } finally {
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setLoading(false);
      setShowTopicInput(false);
    }
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
          subject: selectedSubject.name,
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

  const quizConfigProps = {
    handleSemesterChange,
    handleSubjectChange,
    setProfessorNotes,
    setFile,
    semesters,
    subjects,
    modules,
    selectedSemester,
    selectedModules,
    selectedSubject,
    isAllChecked,
    professorNotes,
    setIsAllChecked,
    setSelectedModules,
  };

  return (
    <div className="container-fluid mb-5 row mt-4 ">
      <div className="col-md-4 col-lg-3">
        <div className="card shadow-sm p-4">
          <QuizConfig {...quizConfigProps} />
          <GenerateQuizBtn
            getResult={getResult}
            loading={loading}
            selectedSubject={selectedSubject}
            selectedModules={selectedModules}
          />
          <div className="btn-group mt-2">
            {user?.isAdmin && (
              <div
                className="btn btn-outline-dark"
                onClick={() => setShowCreateNewQuiz((prev) => !prev)}
              >
                {showCreateNewQuiz ? "Show Stats" : "Create Quiz "}
              </div>
            )}
            <Link className="btn btn-outline-dark" href="/quizzes/take-quiz">
              Take Quiz
            </Link>
          </div>
          <div
            className="btn btn-outline-dark"
            onClick={() => setShowTopicInput(true)}
          >
            Generate from your own topic
          </div>
          {quizStats && (
            <Suspense fallback={<>Loading Quiz Stats...</>}>
              <QuizStats quizStats={quizStats} />
            </Suspense>
          )}
          {showTopicInput && (
            <div className="modal show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Enter Topics (comma separated)
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowTopicInput(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <input
                      type="text"
                      className="form-control"
                      value={customTopics}
                      onChange={(e) => setCustomTopics(e.target.value)}
                      placeholder="e.g., Quantum Physics, Thermodynamics"
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowTopicInput(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGenerateFromTopic}
                    >
                      Generate Questions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-md-8 col-lg-9">
        <div className="card shadow-sm p-4">
          <Suspense fallback={<Loader />}>
            {!questions.length ? (
              showCreateNewQuiz ? (
                <CreateQuiz />
              ) : (
                <QuizChart quizStats={quizStats} />
              )
            ) : showResults ? (
              <Results
                score={score}
                questions={questions}
                userAnswers={userAnswers}
              />
            ) : (
              <ShowQuestions
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                handleSubmit={handleSubmit}
                questions={questions}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

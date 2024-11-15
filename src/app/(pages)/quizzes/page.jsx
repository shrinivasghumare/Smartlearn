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
import CreateQuiz from "@/app/_components/quiz_Components/CreateQuiz";
import COChart from "@/app/_components/quiz_Components/COChart";
import LoaderForQuestions from "@/app/_components/quiz_Components/LoaderForQuestions";
import ProgressBar from "@/app/_components/quiz_Components/ProgressBar";
import CustomTopicInputModal from "@/app/_components/quiz_Components/CustomTopicInputModal";
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
  const [selectedSemester, setSelectedSemester] = useState(""); // Selected semester
  const [subjects, setSubjects] = useState([]); // To store the subjects of the selected semester
  const [semesters, setSemesters] = useState([]); // To store the semesters
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
  const [loadingCustomTopics, setLoadingCustomTopics] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
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
    setLoadingSubjects(true);
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
    setLoadingSubjects(false);
  };

  const handleSubjectChange = async (subject) => {
    setSelectedSubject(subject);
    setLoadingModules(true);
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
    setLoadingModules(false);
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
  Generate multiple-choice questions (MCQs) in JSON format based on the provided modules, notes, topics, and course outcomes. Each question should include one correct answer and three incorrect answers, structured as follows:
  [
    {
      "difficulty": "Easy" | "Medium" | "Hard",
      "category": "{subject name}",
      "question": "{question text}",
      "correct_answer": "{correct answer}",
      "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
      "explanation": "{brief explanation of the correct answer}",
      "topic": "{related topic}",
      "fromNotes": true | false,
      "fromPDF": true | false,
      "bloom_taxonomy": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create", // Select based on question difficulty and taxonomy level (Create is hardest, Remember is easiest)
      "course_outcomes": "{matching course outcome, or null if none provided}",
      "CO": "CO1" | "CO2" | "CO3" | "CO4" | "CO5" | "CO6" // Select the relevant course outcome number
    }
  ]
    Make sure that there is atleast one question from every CO.
  Modules to base questions on: ${selectedModules
    .map((mod) => mod.module_name)
    .join(", ")}
  Topics to consider: ${selectedTopics}
  Notes provided by the professor: ${
    professorNotes ? professorNotes : "No notes provided"
  }
  Course outcomes available: ${
    selectedSubject?.course_outcomes?.map((co) => co).join(", ") ||
    "No course outcomes provided"
  }
  PDF content summary: ${pdfSummary}
  Number of questions to generate: ${NumberOfQuestions}
  Please provide the output strictly in JSON format without any markdown, text, or extra characters. Do not include code blocks or escape characters.
`;

    // console.log(prompt);
    try {
      setLoading(true);
      setShowResults(false);
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
      );
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generation_config: {
          response_mime_type: "application/json",
        },
      });
      const result = await model.generateContent(prompt);
      const parsedData = JSON.parse(result.response.text());
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
  }, [
    selectedModules,
    professorNotes,
    pdfSummary,
    handlePDFSubmit,
    selectedSubject.course_outcomes,
  ]);

  const handleGenerateFromTopic = useCallback(async () => {
    if (!customTopics) {
      alert("Please enter at least one topic.");
      return;
    }
    setLoadingCustomTopics(true);
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
      setLoadingCustomTopics(false);
    }
  }, [customTopics]);

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
    getResult,
    loading,
    user,
    showCreateNewQuiz,
    setShowTopicInput,
    loadingSubjects,
    loadingModules,
    setShowCreateNewQuiz,
  };

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Left Panel: Quiz Configuration */}
        <div className="col-lg-3">
          <div className="card shadow-sm p-3">
            {questions.length > 0 && <COChart questions={questions} />}
            <QuizConfig {...quizConfigProps} />

            {/* Show quiz statistics if available */}
            {quizStats && (
              <Suspense fallback={<span>Loading Quiz Stats...</span>}>
                <QuizStats quizStats={quizStats} />
              </Suspense>
            )}

            {/* Modal for custom topic input */}
            {showTopicInput && (
              <CustomTopicInputModal
                setShowTopicInput={setShowTopicInput}
                customTopics={customTopics}
                setCustomTopics={setCustomTopics}
                loadingCustomTopics={loadingCustomTopics}
                handleGenerateFromTopic={handleGenerateFromTopic}
              />
            )}
          </div>
        </div>

        {/* Right Panel: Quiz Display */}
        <div className="col-lg-9">
          <div className="card shadow-sm p-4">
            <Suspense fallback={<Loader />}>
              {!questions.length ? (
                showCreateNewQuiz ? (
                  <CreateQuiz />
                ) : !loading ? (
                  <QuizChart quizStats={quizStats} />
                ) : (
                  <LoaderForQuestions />
                )
              ) : showResults ? (
                <Results
                  score={score}
                  questions={questions}
                  userAnswers={userAnswers}
                />
              ) : (
                <>
                  <ProgressBar
                    currentQuestionIndex={currentQuestionIndex}
                    questions={questions}
                  />
                  <ShowQuestions
                    currentQuestionIndex={currentQuestionIndex}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    handleSubmit={handleSubmit}
                    questions={questions}
                    userAnswers={userAnswers}
                    setUserAnswers={setUserAnswers}
                  />
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

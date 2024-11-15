import { GenerateQuizBtn, ToggleCheckBtn } from "./Buttons";
import Link from "next/link";
export default function QuizConfig({
  semesters,
  subjects,
  modules,
  selectedSemester,
  selectedModules,
  handleSemesterChange,
  selectedSubject,
  handleSubjectChange,
  isAllChecked,
  setIsAllChecked,
  setSelectedModules,
  setFile,
  professorNotes,
  setProfessorNotes,
  getResult,
  loading,
  user,
  showCreateNewQuiz,
  setShowTopicInput,
  loadingSubjects,
  loadingModules,
  setShowCreateNewQuiz,
}) {
  const handleModuleChange = (module) => {
    const isSelected = selectedModules.includes(module);
    if (isSelected) {
      setSelectedModules(selectedModules.filter((mod) => mod !== module)); // Deselect
    } else {
      setSelectedModules([...selectedModules, module]); // Select
    }
  };
  return (
    <div className="p-4 border rounded shadow-sm">
      <h4 className="text-center mb-4">Configure Quiz</h4>

      <div className="mb-3">
        <label htmlFor="semester" className="form-label">
          Semester:
        </label>
        <select
          className="form-select"
          id="semester"
          value={selectedSemester}
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
      </div>

      <div className="mb-3">
        <label htmlFor="subject" className="form-label">
          Subject:
        </label>
        <select
          className="form-select"
          id="subject"
          value={selectedSubject.name || ""}
          onChange={(e) => {
            const foundSubject = subjects.find(
              (sub) => sub.name === e.target.value
            );
            handleSubjectChange(foundSubject);
          }}
          disabled={!selectedSemester}
        >
          <option value="" disabled>
            {loadingSubjects ? "Fetching..." : "Select Subject"}
          </option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubject && (
        <>
          <div className="form-label">Modules:</div>
          <div className="modules-list">
            {!loadingModules
              ? modules.map((module, index) => (
                  <div className="form-check" key={index}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={module.module_name}
                      checked={selectedModules.includes(module)}
                      onChange={() => handleModuleChange(module)}
                      id={`module-${index}`}
                    />
                    <label
                      className="form-check-label w-100 text-truncate"
                      htmlFor={`module-${index}`}
                    >
                      {module.module_name}
                    </label>
                  </div>
                ))
              : [...Array(6)].map((_, index) => (
                  <div className="form-check placeholder-glow" key={index}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={false}
                      disabled
                    />
                    <label className="form-check-label placeholder col-12 rounded" />
                  </div>
                ))}
          </div>
          <ToggleCheckBtn
            modules={modules}
            isAllChecked={isAllChecked}
            setSelectedModules={setSelectedModules}
            setIsAllChecked={setIsAllChecked}
            loadingModules={loadingModules}
          />
        </>
      )}

      <div className="mt-3">
        <label htmlFor="inputGroupFile01" className="form-label">
          Upload Notes (PDF):
        </label>
        <input
          type="file"
          accept=".pdf"
          className="form-control"
          id="inputGroupFile01"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <div className="mt-3">
        <label className="form-label" htmlFor="professorNotes">
          Professor Notes:
        </label>
        <textarea
          className="form-control"
          id="professorNotes"
          rows="3"
          value={professorNotes}
          onChange={(e) => setProfessorNotes(e.target.value)}
          placeholder="Add your notes here (optional)"
        />
      </div>

      <GenerateQuizBtn
        getResult={getResult}
        loading={loading}
        selectedSubject={selectedSubject}
        selectedModules={selectedModules}
        className="mt-3 w-100"
      />
      <div className="btn-group-vertical w-100" role="group">
        <div className="btn-group d-flex mt-4">
          {user?.isAdmin && (
            <button
              className="btn btn-outline-dark w-100"
              onClick={() => setShowCreateNewQuiz((prev) => !prev)}
            >
              {showCreateNewQuiz ? "Show Stats" : "Create Quiz"}
            </button>
          )}
          <Link
            href="/quizzes/take-quiz"
            className="btn btn-outline-dark w-100"
          >
            Take Quiz
          </Link>
        </div>

        <button
          className="btn btn-outline-dark rounded-top-0"
          onClick={() => setShowTopicInput(true)}
        >
          Create Your Own!
        </button>
      </div>
    </div>
  );
}

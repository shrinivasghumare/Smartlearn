import { ToggleCheckBtn } from "./Buttons";
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
    <div>
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

        <label htmlFor="subject" className="form-label">
          Subject:
        </label>
        <select
          className="form-select mb-3"
          id="subject"
          value={selectedSubject.name || ""}
          onChange={(e) => handleSubjectChange(e.target.value)}
          disabled={!selectedSemester}
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
            <div className="form-label">Modules:</div>
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
            <ToggleCheckBtn
              modules={modules}
              isAllChecked={isAllChecked}
              setSelectedModules={setSelectedModules}
              setIsAllChecked={setIsAllChecked}
            />
          </>
        )}
        <input
          type="file"
          accept=".pdf"
          className="form-control mt-2"
          id="inputGroupFile01"
          onChange={(e) => setFile(e.target.files[0])}
        />
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
      </div>
    </div>
  );
}

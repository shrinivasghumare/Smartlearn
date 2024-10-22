export function ToggleCheckBtn({
  modules,
  isAllChecked,
  setSelectedModules,
  setIsAllChecked,
}) {
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
  return (
    <button
      className="mt-2 btn btn-sm btn-outline-dark w-100"
      onClick={toggleCheckAll}
    >
      {isAllChecked ? "Uncheck All" : "Check All"}
    </button>
  );
}

export function GenerateQuizBtn({
  getResult,
  loading,
  selectedSubject,
  selectedModules,
}) {
  return (
    <button
      className="btn btn-dark w-100 mt-2"
      onClick={getResult}
      disabled={loading || !selectedSubject || !selectedModules.length}
    >
      {loading ? "Loading..." : "Generate Questions"}
    </button>
  );
}

import { memo } from "react";
const CustomTopicInputModal = ({
  setShowTopicInput,
  customTopics,
  setCustomTopics,
  loadingCustomTopics,
  handleGenerateFromTopic,
}) => {
  return (
    <div
      className="modal show"
      style={{
        display: "block",
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Enter Topics (comma separated)</h5>
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
              className="btn btn-outline-dark"
              onClick={() => setShowTopicInput(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-dark"
              disabled={!customTopics || loadingCustomTopics}
              onClick={handleGenerateFromTopic}
            >
              {loadingCustomTopics ? "Loading..." : "Generate Questions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(CustomTopicInputModal);

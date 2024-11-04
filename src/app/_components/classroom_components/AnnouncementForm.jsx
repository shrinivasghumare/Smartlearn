import { useState, useContext } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import LayoutContext from "@/app/context/LayoutContext";

export default function AnnouncementForm({ classroomId, onAddAnnouncement }) {
  const [content, setContent] = useState("");
  const { user } = useContext(LayoutContext);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [totalScore, setTotalScore] = useState(10);

  const handleSubmit = async () => {
    setPostLoading(true);
    let fileUrl = null;

    if (file) {
      setFileLoading(true);
      const { data, error } = await supabase.storage
        .from(isGraded ? `assignments/${classroomId}` : "materials") // Store assignments separately
        .upload(`${Date.now()}_${file.name}`, file);
      setFileLoading(false);
      if (error) {
        console.error("File upload error:", error);
        setPostLoading(false);
        return;
      }
      fileUrl = data.path;
    }

    const table = isGraded ? "assignments" : "announcements";
    const insertData = {
      content,
      classroom_id: classroomId,
      created_by: user?.roll_no,
      file_url: fileUrl,
    };
    if (isGraded) {
      insertData.total_score = totalScore;
    }

    const { error } = await supabase.from(table).insert([insertData]);

    setPostLoading(false);
    if (!error) {
      setContent("");
      setFile(null);
      setIsGraded(false);
      setTotalScore(10); // Reset total score
      onAddAnnouncement();
    }
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="card-title mb-3">Create post</h4>
      <div className="mb-3">
        <textarea
          className="form-control"
          placeholder="Write your announcement here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          required
          disabled={postLoading || fileLoading}
        />
      </div>
      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={postLoading || fileLoading}
        />
      </div>
      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="isGraded"
          checked={isGraded}
          onChange={(e) => setIsGraded(e.target.checked)}
          disabled={postLoading || fileLoading}
        />
        <label className="form-check-label" htmlFor="isGraded">
          Is this an assignment?
        </label>
      </div>
      {isGraded && (
        <div className="mb-3">
          <label htmlFor="totalScore" className="form-label">
            Total Score:
          </label>
          <input
            type="number"
            className="form-control"
            id="totalScore"
            value={totalScore}
            onChange={(e) => setTotalScore(parseInt(e.target.value) || 0)} // Handle invalid input
            min="0"
            disabled={postLoading || fileLoading}
          />
        </div>
      )}

      <button
        className="btn btn-dark"
        onClick={handleSubmit}
        disabled={!content.trim() || postLoading || fileLoading}
      >
        {postLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />{" "}
            Posting...
          </>
        ) : (
          "Post"
        )}
      </button>
      {fileLoading && (
        <p className="text-muted mt-2">
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />{" "}
          Uploading file...
        </p>
      )}
    </div>
  );
}

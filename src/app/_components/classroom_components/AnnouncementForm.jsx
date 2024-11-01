import { useState, useContext } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import LayoutContext from "@/app/context/LayoutContext";

export default function AnnouncementForm({ classroomId, onAddAnnouncement }) {
  const [content, setContent] = useState("");
  const { user } = useContext(LayoutContext);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  const handleSubmit = async () => {
    setPostLoading(true);
    let fileUrl = null;

    if (file) {
      setFileLoading(true);
      const { data, error } = await supabase.storage
        .from("materials")
        .upload(`public/${Date.now()}_${file.name}`, file);
      setFileLoading(false);

      if (error) {
        console.error("File upload error:", error);
        setPostLoading(false);
        return;
      }
      fileUrl = data.path;
    }

    const { error } = await supabase.from("announcements").insert([
      {
        content,
        classroom_id: classroomId,
        created_by: user?.roll_no,
        file_url: fileUrl,
      },
    ]);

    setPostLoading(false);
    if (!error) {
      setContent("");
      setFile(null);
      onAddAnnouncement();
    }
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h4 className="card-title mb-3">Post a New Announcement</h4>
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

import { useState, useContext } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import LayoutContext from "@/app/context/LayoutContext";

export default function AnnouncementForm({ classroomId, onAddAnnouncement }) {
  const [content, setContent] = useState("");
  const { user } = useContext(LayoutContext);

  const handleSubmit = async () => {
    await supabase
      .from("announcements")
      .insert([
        { content, classroom_id: classroomId, created_by: user?.roll_no },
      ]);
    setContent("");
    onAddAnnouncement();
  };

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-3">Post a New Announcement</h4>
      <div className="mb-3">
        <textarea
          className="form-control"
          placeholder="Write your announcement here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          required
        />
      </div>
      <button
        className="btn btn-dark"
        onClick={handleSubmit}
        disabled={!content.trim()}
      >
        Post
      </button>
    </div>
  );
}

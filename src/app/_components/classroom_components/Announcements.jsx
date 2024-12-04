import { memo } from "react";
import { FileIcon } from "@/app/_components/classroom_components/icons";
import { supabase } from "@/app/_lib/supabaseClient";
const Announcements = ({
  loading,
  user,
  deleteAnnouncement,
  announcements,
}) => {
  return (
    <div className="announcements-list mt-4">
      <h3 className="mb-3">Announcements</h3>
      {loading ? (
        <div className="text-center my-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : announcements.length > 0 ? (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="card mb-3"
            onMouseEnter={(e) => {
              const deleteIcon = e.currentTarget.querySelector(".delete-icon");
              if (deleteIcon) deleteIcon.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              const deleteIcon = e.currentTarget.querySelector(".delete-icon");
              if (deleteIcon) deleteIcon.style.opacity = "0";
            }}
          >
            <div className="card-body position-relative">
              {user?.isAdmin && (
                <span
                  className="delete-icon position-absolute top-0 end-0 m-2 text-danger fs-5"
                  style={{
                    cursor: "pointer",
                    opacity: "0",
                    transition: "opacity 0.3s ease",
                  }}
                  onClick={() => deleteAnnouncement(announcement.id)}
                >
                  &times;
                </span>
              )}
              <p className="card-text mb-2 text-dark">{announcement.content}</p>
              <div className="d-flex justify-content-between">
                {announcement.file_url && (
                  <a
                    href={
                      supabase.storage
                        .from("materials")
                        .getPublicUrl(announcement.file_url).data.publicUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-decoration-none d-flex align-items-center"
                  >
                    <FileIcon />
                    View Attachment
                  </a>
                )}

                <small className="text-muted d-block mb-2">
                  {new Date(announcement.created_at).toGMTString()}
                </small>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No announcements yet.</p>
      )}
    </div>
  );
};
export default memo(Announcements);

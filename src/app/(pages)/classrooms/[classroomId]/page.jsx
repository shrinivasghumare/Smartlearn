"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import AnnouncementForm from "@/app/_components/classroom_components/AnnouncementForm";
import LayoutContext from "@/app/context/LayoutContext";

export default function ClassroomDetails({ params }) {
  const { classroomId } = params;
  const [classroom, setClassroom] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, router } = useContext(LayoutContext);

  const fetchClassroom = useCallback(async () => {
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", classroomId)
      .single();
    if (error) console.log(error);
    else setClassroom(data);
  }, [classroomId]);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });
    if (error) console.log(error);
    else setAnnouncements(data);
    setLoading(false);
  }, [classroomId]);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from("classroom_members")
      .select("roll_no(*)")
      .eq("classroom_id", classroomId);
    if (error) console.log(error);
    else setMembers(data.map((member) => member.roll_no));
  }, [classroomId]);

  const deleteAnnouncement = async (announcementId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this announcement?"
    );
    if (confirmDelete) {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);
      if (error) console.error("Error deleting announcement:", error);
      else fetchAnnouncements(); // Refresh announcements after deletion
    }
  };

  const leaveClassroom = async () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this classroom?"
    );
    if (confirmLeave) {
      const { error } = await supabase
        .from("classroom_members")
        .delete()
        .eq("roll_no", user?.roll_no)
        .eq("classroom_id", classroomId);
      if (error) console.error("Error leaving classroom:", error);
      else router.push("/assignments"); // Redirect back to the main classroom page
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
      fetchAnnouncements();
      fetchMembers();
    }
  }, [classroomId, fetchClassroom, fetchAnnouncements, fetchMembers]);
  return (
    <div className="container my-4">
      {classroom && (
        <>
          <div className="d-flex justify-content-between mb-4">
            <h1>{classroom.name}</h1>
            <div
              style={{ cursor: "pointer" }}
              title="Leave"
              onClick={leaveClassroom}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="bi bi-box-arrow-right"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                />
              </svg>
            </div>
          </div>
          <p>{classroom.description}</p>
          <div className="row">
            <div className="col-lg-8">
              {user?.isAdmin && (
                <AnnouncementForm
                  classroomId={classroomId}
                  onAddAnnouncement={fetchAnnouncements}
                />
              )}
              <div className="announcements-list mt-4">
                {loading ? (
                  <p>Loading announcements...</p>
                ) : announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="announcement-item position-relative p-3 mb-3 border rounded shadow-sm"
                      onMouseEnter={(e) => {
                        const deleteIcon =
                          e.currentTarget.querySelector(".delete-icon");
                        if (deleteIcon) deleteIcon.style.display = "block";
                      }}
                      onMouseLeave={(e) => {
                        const deleteIcon =
                          e.currentTarget.querySelector(".delete-icon");
                        if (deleteIcon) deleteIcon.style.display = "none";
                      }}
                    >
                      {user?.isAdmin && (
                        <span
                          className="delete-icon position-absolute top-0 end-0 m-2 text-danger"
                          style={{ cursor: "pointer", display: "none" }}
                          onClick={() => deleteAnnouncement(announcement.id)}
                        >
                          &times;
                        </span>
                      )}
                      <p className="mb-0">{announcement.content}</p>
                      <small className="text-muted">
                        {new Date(announcement.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No announcements yet.</p>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <h3>Class Members</h3>
              {members.length > 0 ? (
                <ul className="list-group">
                  {members.map((member, idx) => (
                    <li key={idx} className="list-group-item">
                      <strong>
                        {member?.username} - {member?.roll_no}
                      </strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">
                  No members have joined this classroom yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

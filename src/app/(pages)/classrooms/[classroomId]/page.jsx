"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import AnnouncementForm from "@/app/_components/classroom_components/AnnouncementForm";
import LayoutContext from "@/app/context/LayoutContext";
import {
  FileIcon,
  LeaveIcon,
} from "@/app/_components/classroom_components/icons";
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
      else fetchAnnouncements();
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
      else router.push("/classrooms");
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-5">{classroom.name}</h1>
            <button
              className="btn btn-outline-danger d-flex align-items-center"
              onClick={leaveClassroom}
            >
              <LeaveIcon /> Quit
            </button>
          </div>
          <p className="lead">{classroom.description}</p>

          <div className="row">
            <div className="col-lg-8">
              {user?.isAdmin && (
                <AnnouncementForm
                  classroomId={classroomId}
                  onAddAnnouncement={fetchAnnouncements}
                />
              )}
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
                        const deleteIcon =
                          e.currentTarget.querySelector(".delete-icon");
                        if (deleteIcon) deleteIcon.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        const deleteIcon =
                          e.currentTarget.querySelector(".delete-icon");
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
                        <p className="card-text mb-2 text-dark">
                          {announcement.content}
                        </p>
                        <div className="d-flex justify-content-between">
                          {announcement.file_url && (
                            <a
                              href={
                                supabase.storage
                                  .from("materials")
                                  .getPublicUrl(announcement.file_url).data
                                  .publicUrl
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

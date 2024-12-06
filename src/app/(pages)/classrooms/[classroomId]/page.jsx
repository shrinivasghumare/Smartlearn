//classrooms/[classroomId]/page.jsx
"use client";
import { useEffect, useState, useContext, useCallback, memo } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import LayoutContext from "@/app/context/LayoutContext";
import AnnouncementForm from "@classroomComponents/AnnouncementForm";
import Announcements from "@classroomComponents/Announcements";
import AssignmentList from "@classroomComponents/AssignmentList";
import ClassMembers from "@classroomComponents/ClassMembers";
import PollForm from "@classroomComponents/PollForm";
import Polls from "@classroomComponents/Polls";
const ClassroomDetails = ({ params }) => {
  const { classroomId } = params;
  const [classroom, setClassroom] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, router } = useContext(LayoutContext);
  const [assignments, setAssignments] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [polls, setPolls] = useState([]);
  const [showPollForm, setShowPollForm] = useState(false);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const fetchAssignments = useCallback(async () => {
    // fetching all the assignments
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) console.log(error);

    if (user && data) {
      // Check if the user is admin to fetch submission counts for each assignment
      if (user?.isAdmin) {
        const submissions = {};
        const assignmentData = await Promise.all(
          data.map(async (assignment) => {
            const { data, error } = await supabase
              .from("student_submissions")
              .select("*", { count: "exact" })
              .eq("assignment_id", assignment.id);
            if (error) console.error(error);
            const submittedBy = data.map((submission) => submission.student_id);
            submittedBy.forEach((studentId) => {
              if (submissions[studentId]) submissions[studentId]++;
              else submissions[studentId] = 1;
            });
            return {
              ...assignment,
              submissionCount: data.length || 0,
              submittedBy: submittedBy,
            };
          })
        );
        setStudentSubmissions(submissions);
        setAssignments(assignmentData);
      } else {
        // If the user is a student, check their grade for each assignment
        const assignmentData = await Promise.all(
          data.map(async (assignment) => {
            const { data: submission, error: submissionError } = await supabase
              .from("student_submissions")
              .select("grade")
              .eq("assignment_id", assignment.id)
              .eq("student_id", user?.roll_no);
            // if (submissionError) console.error(submissionError);
            return {
              ...assignment,
              grade: submission?.grade,
            };
          })
        );
        setAssignments(assignmentData);
      }
    }
  }, [classroomId, user]);

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
    fetchAssignments();
  }, [classroomId, fetchAssignments]);

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

  const fetchPolls = useCallback(async () => {
    setLoadingPolls(true);
    const { data: pollsData } = await supabase
      .from("polls")
      .select("*, poll_votes(user_id,selected_option)")
      .eq("classroom_id", classroomId);
    setPolls(pollsData || []);
    setLoadingPolls(false);
  }, [classroomId]);

  const handlePollCreated = (newPoll) => {
    if (newPoll) setPolls((prev) => [newPoll, ...prev]);
    setShowPollForm(false);
  };

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
      fetchMembers();
      fetchPolls();
      fetchAnnouncements();
      fetchAssignments();
    }
  }, [
    classroomId,
    fetchClassroom,
    fetchAnnouncements,
    fetchMembers,
    fetchAssignments,
    fetchPolls,
  ]);

  return (
    <div className="container my-4">
      {classroom && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-5">{classroom?.name}</h1>
            <button
              className="btn btn-outline-danger d-flex align-items-center"
              onClick={leaveClassroom}
            >
              <i class="bi bi-box-arrow-right" /> Quit
            </button>
          </div>
          <p className="lead">{classroom?.description}</p>

          <div className="row">
            <div className="col-lg-8">
              {user?.isAdmin && (
                <>
                  <AnnouncementForm
                    classroomId={classroomId}
                    onAddAnnouncement={fetchAnnouncements}
                  />
                  {!showPollForm ? (
                    <div className="mb-4">
                      <button
                        className="btn btn-dark"
                        onClick={() => setShowPollForm(true)}
                      >
                        Create Poll
                      </button>
                    </div>
                  ) : (
                    <PollForm
                      classroomId={classroomId}
                      onPollCreated={handlePollCreated}
                    />
                  )}
                </>
              )}
              <Announcements
                loading={loading}
                user={user}
                deleteAnnouncement={deleteAnnouncement}
                announcements={announcements}
              />
              {loadingPolls ? (
                <div className="text-center my-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Polls polls={polls} user={user} />
              )}
            </div>

            <ClassMembers
              members={members}
              assignments={assignments}
              studentSubmissions={studentSubmissions}
              classroom={classroom}
              user={user}
            />

            <AssignmentList
              assignments={assignments}
              classroom={classroom}
              user={user}
            />
          </div>
        </>
      )}
    </div>
  );
};
export default memo(ClassroomDetails);

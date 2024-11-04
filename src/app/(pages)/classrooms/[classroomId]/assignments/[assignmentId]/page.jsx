"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "@/app/_lib/supabaseClient";
import LayoutContext from "@/app/context/LayoutContext";

export default function AssignmentPage({ params }) {
  const { assignmentId } = params;
  const { user } = useContext(LayoutContext);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [studentFile, setStudentFile] = useState(null);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [submissionGrades, setSubmissionGrades] = useState({});
  const [isUpdatingGrade, setIsUpdatingGrade] = useState({});
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", assignmentId)
        .single();
      if (error) console.error("Error fetching assignment:", error);
      else setAssignmentDetails(data);
    };

    const fetchSubmissions = async () => {
      if (user) {
        let data, error;
        if (!user.isAdmin) {
          ({ data, error } = await supabase
            .from("student_submissions")
            .select("*")
            .eq("assignment_id", assignmentId)
            .eq("student_id", user.roll_no)
            .single());
        } else {
          ({ data, error } = await supabase
            .from("student_submissions")
            .select("*")
            .eq("assignment_id", assignmentId));
        }
        if (error && error.status !== 406) {
          console.error("Error fetching submissions:", error);
        } else if (data) {
          if (user.isAdmin) {
            setStudentSubmissions(data);
            const initialGrades = data.reduce(
              (acc, submission) => ({
                ...acc,
                [submission.id]: submission.grade || "",
              }),
              {}
            );
            setSubmissionGrades(initialGrades);
          } else {
            setStudentSubmissions([data]);
            setSubmissionGrades({ [data.id]: data.grade || "" });
          }
        }
      }
    };

    fetchAssignmentDetails();
    fetchSubmissions();
  }, [assignmentId, user]);

  const handleAssignmentSubmit = async () => {
    setIsSubmittingAssignment(true);

    if (!studentFile) {
      alert("Please select a file to submit.");
      setIsSubmittingAssignment(false);
      return;
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(`assignments/${assignmentDetails.classroom_id}`)
      .upload(`${Date.now()}_${studentFile.name}`, studentFile);

    if (uploadError) {
      console.error("File upload error:", uploadError);
      setIsSubmittingAssignment(false);
      return;
    }

    const submissionData = {
      assignment_id: assignmentId,
      student_id: user.roll_no,
      file_url: uploadData.path,
    };

    const { error: dbError } = studentSubmissions.length
      ? await supabase
          .from("student_submissions")
          .update(submissionData)
          .eq("id", studentSubmissions[0].id)
      : await supabase.from("student_submissions").insert(submissionData);

    if (dbError) {
      console.error("Database error:", dbError);
    } else {
      alert("Assignment submitted successfully!");
      window.location.reload();
    }

    setIsSubmittingAssignment(false);
  };

  const handleGradeUpdate = async (submissionId, grade) => {
    setIsUpdatingGrade((prev) => ({ ...prev, [submissionId]: true }));

    const { error } = await supabase
      .from("student_submissions")
      .update({ grade })
      .eq("id", submissionId);

    if (error) {
      console.error("Error updating grade:", error);
    } else {
      setNotification("Grade updated successfully!");
      setTimeout(() => setNotification(""), 3000); // Reset notification
    }

    setIsUpdatingGrade((prev) => ({ ...prev, [submissionId]: false }));
  };

  if (!assignmentDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-5">
      <h3 className="text-center mb-4">{assignmentDetails.content}</h3>
      {assignmentDetails.file_url && (
        <div className="text-center my-3">
          <a
            href={
              supabase.storage
                .from(`assignments/${assignmentDetails.classroom_id}`)
                .getPublicUrl(assignmentDetails.file_url).data.publicUrl
            }
            className="btn btn-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Attachment
          </a>
        </div>
      )}

      {user?.isAdmin ? (
        <div>
          <h3 className="mt-4">Student Submissions</h3>
          {notification && (
            <div className="alert alert-success">{notification}</div>
          )}
          {studentSubmissions.map((submission) => (
            <div key={submission.id} className="card my-3 p-3 shadow-sm border">
              <p className="fw-bold">
                Submission from (Roll No:{" "}
                <strong>{submission.student_id}</strong>)
              </p>
              {submission.file_url && (
                <a
                  href={
                    supabase.storage
                      .from(`assignments/${assignmentDetails.classroom_id}`)
                      .getPublicUrl(submission.file_url).data.publicUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-link"
                >
                  View Submission
                </a>
              )}
              <div className="input-group my-3">
                <span className="input-group-text">Grade:</span>
                <input
                  type="number"
                  className="form-control"
                  value={submissionGrades[submission.id] || ""}
                  onChange={(e) =>
                    setSubmissionGrades({
                      ...submissionGrades,
                      [submission.id]: parseInt(e.target.value, 10),
                    })
                  }
                  min="0"
                  max={assignmentDetails.total_score}
                  placeholder={`Enter Grade (Max: ${assignmentDetails.total_score})`}
                />
                <button
                  className="btn btn-outline-dark"
                  onClick={() =>
                    handleGradeUpdate(
                      submission.id,
                      submissionGrades[submission.id]
                    )
                  }
                  disabled={isUpdatingGrade[submission.id]}
                >
                  {isUpdatingGrade[submission.id] ? "Updating..." : "Set Grade"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {!studentSubmissions.length && (
            <div className="text-center">
              <h3 className="mb-4">Submit Assignment</h3>
              <input
                type="file"
                className="form-control my-2"
                onChange={(e) => setStudentFile(e.target.files[0])}
              />
              <button
                onClick={handleAssignmentSubmit}
                className="btn btn-dark btn-lg mt-2"
                disabled={isSubmittingAssignment}
              >
                {isSubmittingAssignment ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
          {studentSubmissions[0]?.file_url && (
            <div className="text-center my-3">
              <p>Your Submission:</p>
              <a
                href={
                  supabase.storage
                    .from(`assignments/${assignmentDetails.classroom_id}`)
                    .getPublicUrl(studentSubmissions[0].file_url).data.publicUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-link"
              >
                View Your Submission
              </a>
              {submissionGrades[studentSubmissions[0].id] !== null && (
                <p className="mt-2">
                  Your Grade: {submissionGrades[studentSubmissions[0].id]} /{" "}
                  {assignmentDetails.total_score}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

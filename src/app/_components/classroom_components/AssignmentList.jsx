import { memo } from "react";
import Link from "next/link";
import { supabase } from "@/app/_lib/supabaseClient";
import { FileIcon } from "@classroomComponents/icons";
const AssignmentList = ({ assignments, classroom, user }) => {
  return (
    <div className="assignments-list mt-4">
      <h3 className="mb-3">Assignments</h3>
      {assignments?.length > 0 ? (
        assignments.map((assignment) => (
          <div key={assignment.id} className="card mb-3">
            <div className="card-body">
              <Link
                href={`/classrooms/${classroom.id}/assignments/${assignment.id}`}
                className="text-dark text-decoration-none"
              >
                <h5 className="card-title">{assignment.content}</h5>
              </Link>
              <p>Total Score: {assignment.total_score}</p>
              {user?.isAdmin ? (
                <p>Submissions: {assignment.submissionCount} students</p>
              ) : (
                <p>
                  {assignment.grade === null
                    ? "Not graded!"
                    : assignment.grade === undefined
                    ? "No Submissions done yet!"
                    : `Grade: ${assignment.grade} / ${assignment.total_score}`}
                </p>
              )}
              {assignment.file_url && (
                <a
                  href={
                    supabase.storage
                      .from(`assignments/${classroom.id}`)
                      .getPublicUrl(assignment.file_url).data.publicUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-decoration-none d-flex align-items-center"
                >
                  <FileIcon /> View Attachment
                </a>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No assignments yet.</p>
      )}
    </div>
  );
};
export default memo(AssignmentList);

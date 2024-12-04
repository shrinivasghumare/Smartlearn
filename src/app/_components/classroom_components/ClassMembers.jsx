import { memo } from "react";
const ClassMembers = (props) => {
  const { members, assignments, studentSubmissions, classroom, user } = props;
  return (
    <div className="col-lg-4">
      <h3>Class Members</h3>
      {members.length > 0 ? (
        <ul className="list-group">
          {members.map((member, idx) => {
            const progress = Math.round(
              (100 * studentSubmissions[member?.roll_no?.toString()]) /
                assignments?.length
            );
            const creator = member.roll_no == classroom.created_by;
            return (
              <Member
                key={idx}
                idx={idx}
                member={member}
                creator={creator}
                user={user}
                progress={progress}
                studentSubmissions={studentSubmissions}
                assignments={assignments}
              />
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">No members have joined this classroom yet.</p>
      )}
    </div>
  );
};
export default memo(ClassMembers);

function Member({
  idx,
  member,
  creator,
  user,
  progress,
  studentSubmissions,
  assignments,
}) {
  return (
    <li key={idx} className="list-group-item d-flex align-items-center">
      <strong className="w-100">
        {member?.username} - {member?.roll_no}
      </strong>
      {creator && <div className="text-muted">Creator</div>}
      {user?.isAdmin && !creator && (
        <div
          className="progress w-100"
          role="progressbar"
          style={{
            height: "15px",
          }}
        >
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
            }}
          >
            {!isNaN(progress) &&
              studentSubmissions[member?.roll_no] + "/" + assignments?.length}
          </div>
        </div>
      )}
    </li>
  );
}

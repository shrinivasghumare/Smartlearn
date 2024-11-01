import { useContext, memo } from "react";
import LayoutContext from "@/app/context/LayoutContext";

const ClassroomCard = memo(({ classroom }) => {
  const { router } = useContext(LayoutContext);

  return (
    <div
      className="card mb-3 shadow-sm p-3 classroom-card"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/classrooms/${classroom.id}`)}
    >
      <div className="card-body">
        <h5 className="card-title">{classroom.name}</h5>
        <p className="card-text text-muted">{classroom.description}</p>
      </div>
    </div>
  );
});
ClassroomCard.displayName = "ClassroomCard";
export default ClassroomCard;

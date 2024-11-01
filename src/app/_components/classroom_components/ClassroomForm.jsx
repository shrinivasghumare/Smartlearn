import { useState, memo } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

const ClassroomForm = memo(
  ({ formType, onClose, onRefresh, user, classrooms }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [classroomId, setClassroomId] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (formType === "create") {
        const { data, error } = await supabase
          .from("classrooms")
          .insert([{ name, description, created_by: user?.roll_no }])
          .select();
        console.log({ data, error });
        if (data) {
          await supabase
            .from("classroom_members")
            .insert([{ roll_no: user?.roll_no, classroom_id: data[0].id }]);
          onRefresh();
          navigator.clipboard.writeText(data[0].id);
          alert("classroom Code: " + data[0].id + "\nCopied to Clipboard!");
        }
      } else if (formType === "join") {
        if (classrooms.some((cr) => cr.id.toString() === classroomId)) {
          alert("You have already joined this classroom!");
          return;
        }

        const { data, error } = await supabase
          .from("classroom_members")
          .insert([{ roll_no: user?.roll_no, classroom_id: classroomId }]);

        if (error) {
          alert("Classroom not Found!");
          return;
        }

        onRefresh();
      }
      onClose();
    };

    return (
      <div className="card p-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <h4 className="card-title text-center mb-4">
            {formType === "create" ? "Create Classroom" : "Join Classroom"}
          </h4>
          {formType === "create" ? (
            <>
              <div className="form-group mb-3">
                <label className="form-label">Classroom Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter classroom name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Enter classroom description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group mb-3">
              <label className="form-label">Classroom ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter classroom ID"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                required
              />
            </div>
          )}
          <div className="d-flex justify-content-between">
            <button className="btn btn-dark w-50 me-2" type="submit">
              {formType === "create" ? "Create" : "Join"}
            </button>
            <button className="btn btn-outline-dark w-50" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }
);
ClassroomForm.displayName = "ClassroomForm";
export default ClassroomForm;

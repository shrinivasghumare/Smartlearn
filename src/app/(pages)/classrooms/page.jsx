"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import LayoutContext from "@/app/context/LayoutContext";
import ClassroomCard from "@/app/_components/classroom_components/ClassroomCard";
import ClassroomForm from "@/app/_components/classroom_components/ClassroomForm";
import { supabase } from "@/app/_lib/supabaseClient";
import "./styles.css";

export default function ClassroomPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("create");
  const { user } = useContext(LayoutContext);

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("classroom_members")
      .select("classrooms(*)")
      .eq("roll_no", user?.roll_no);
    if (data) setClassrooms(data.map((member) => member.classrooms));
    setLoading(false);
  }, [user?.roll_no]);

  useEffect(() => {
    if (user?.roll_no) {
      fetchClassrooms();
    }
  }, [user, fetchClassrooms]);

  const handleCreate = () => {
    setFormType("create");
    setShowForm(true);
  };

  const handleJoin = () => {
    setFormType("join");
    setShowForm(true);
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          {showForm ? (
            <ClassroomForm
              formType={formType}
              onClose={() => setShowForm(false)}
              onRefresh={fetchClassrooms}
              user={user}
              classrooms={classrooms}
            />
          ) : (
            <div className="card p-3 shadow-sm">
              <h5 className="card-title text-center mb-3">Manage Classrooms</h5>
              <div className="d-grid gap-2">
                {user?.isAdmin && (
                  <button className="btn btn-dark" onClick={handleCreate}>
                    Create Classroom
                  </button>
                )}
                <button className="btn btn-outline-dark" onClick={handleJoin}>
                  Join Classroom
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <h3 className="mb-4 display-5 d-flex align-items-center">
            Your Classrooms
          </h3>
          {loading ? (
            <div className="d-flex align-items-center">
              <div
                className="spinner-border text-primary me-2"
                role="status"
              ></div>
              <span>Loading classrooms...</span>
            </div>
          ) : classrooms.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="col classroomCard">
                  <ClassroomCard classroom={classroom} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted">
              <p className="mb-1">No classrooms joined yet.</p>
              <p>
                Click{" "}
                <span className="fw-bold text-primary">&quot;Join Classroom&quot;</span>{" "}
                to start learning!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

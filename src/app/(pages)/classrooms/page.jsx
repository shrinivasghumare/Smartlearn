"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import LayoutContext from "@/app/context/LayoutContext";
import ClassroomCard from "@/app/_components/classroom_components/ClassroomCard";
import ClassroomForm from "@/app/_components/classroom_components/ClassroomForm";
import { supabase } from "@/app/_lib/supabaseClient";

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
    <div className="container mt-5">
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
            <div className="d-flex flex-column">
              {user?.isAdmin && (
                <button className="btn btn-dark mb-2" onClick={handleCreate}>
                  Create Classroom
                </button>
              )}
              <button className="btn btn-outline-dark" onClick={handleJoin}>
                Join Classroom
              </button>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <h3 className="mb-3">Your Classrooms &#x1F3DB;</h3>
          {loading ? (
            <p>Loading classrooms...</p>
          ) : classrooms.length > 0 ? (
            classrooms.map((classroom) => (
              <ClassroomCard key={classroom.id} classroom={classroom} />
            ))
          ) : (
            <p className="text-muted">No classrooms joined yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

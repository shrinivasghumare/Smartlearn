"use client";
import { useState } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

export default function InsertModuleBox({ modules, subject, setModules }) {
  const [newModuleName, setNewModuleName] = useState("");

  //inserting a new module to {subject}
  const handleInsertModule = async () => {
    if (!newModuleName.trim()) {
      alert("Please enter a module name");
      return;
    }

    try {
      let { data, error } = await supabase
        .from("subjects")
        .update({ modules: [...(modules || []), newModuleName.trim()] })
        .eq("subject_name", subject)
        .select();

      if (error) throw error;

      // If no matching subject is found, create a new entry
      if (data.length === 0) {
        ({ data, error } = await supabase
          .from("subjects")
          .insert([{ subject_name: subject, modules: [newModuleName.trim()] }])
          .select());

        if (error) throw error;
      }

      // Update state and local storage with the new module list
      const updatedModules = data[0]?.modules;
      setModules(updatedModules);
      localStorage.setItem("modules", JSON.stringify(updatedModules));
      setNewModuleName("");
    } catch (err) {
      console.error("Error updating module: ", err);
    }
  };

  return (
    <div className="col-md-4 mb-3">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Add a Module!</h5>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              id="new-module"
              className="m-1"
              onChange={(e) => setNewModuleName(e.target.value)}
              value={newModuleName}
              required
            />
            <button
              className="btn btn-outline-dark m-1"
              onClick={handleInsertModule}
              type="submit"
              disabled={!newModuleName.trim()}
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

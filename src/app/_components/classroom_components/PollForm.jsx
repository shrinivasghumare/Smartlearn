import { useState, useContext } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

import LayoutContext from "@/app/context/LayoutContext";

export default function PollForm({ classroomId, onPollCreated }) {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState([""]);
  const { user } = useContext(LayoutContext);
  const [loading, setLoading] = useState(false);

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };
  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || options.some((opt) => !opt.trim())) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("polls")
      .insert({
        classroom_id: classroomId,
        title,
        options,
        created_by: user.roll_no,
      })
      .select();
    console.log({ data, error });
    setLoading(false);
    if (error) {
      console.error(error);
      alert("Failed to create poll.");
    } else {
      onPollCreated(data[0]);
      setTitle("");
      setOptions([""]);
    }
  };

  return (
    <div className="poll-form card shadow-sm p-4 mb-4">
      <h4 className="card-title mb-3">Create Poll</h4>
      <input
        type="text"
        placeholder="Poll Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-control mb-3"
        required
      />
      {options.map((option, index) => (
        <div key={index} className="d-flex mb-2">
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="form-control me-2"
            required
          />
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => removeOption(index)}
          >
            <i className="bi bi-trash3" />
          </button>
        </div>
      ))}
      <button className="btn btn-outline-dark mb-3" onClick={addOption}>
        <i className="bi bi-plus-circle-dotted" />
      </button>
      <div className="d-flex input-group mb-3">
        <button
          className="btn btn-dark"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
        <button
          className="btn btn-outline-dark"
          onClick={() => onPollCreated(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

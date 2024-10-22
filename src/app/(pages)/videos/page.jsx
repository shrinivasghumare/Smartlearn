"use client";
import { useState, useEffect, useCallback, useContext } from "react";
import { supabase } from "@lib/supabaseClient";
import LayoutContext from "@context/LayoutContext";
import InsertModuleBox from "@components/video_components/InsertModuleBox";
import Link from "next/link";
import "./styles.css";
import "@/app/globals.css";
const Videos = () => {
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]); // fetched subjects
  const [modules, setModules] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false); // subject loading state
  const [loadingModules, setLoadingModules] = useState(false); // video loading state
  const [moduleMessage, setModuleMessage] = useState(
    "No videos available for the selected course"
  );
  const branches = ["CE", "AIDS", "ECS", "MECH"];
  const years = ["FE", "SE", "TE", "BE"];
  const { user } = useContext(LayoutContext);
  useEffect(() => {
    setBranch(localStorage.getItem("branch") || "");
    setYear(localStorage.getItem("year") || "");
    setSubject(localStorage.getItem("subject") || "");
    setSubjects(JSON.parse(localStorage.getItem("subjects")) || []);
  }, []);

  // Fetch subjects from Supabase
  const fetchSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    const { data, error } = await supabase
      .from("branches")
      .select("subject")
      .eq("branch", branch)
      .eq("year", year);

    setLoadingSubjects(false);

    if (error) {
      console.error("Error fetching subjects:", error);
    } else {
      const subjectsList = data[0]?.subject || [];
      localStorage.setItem("subjects", JSON.stringify(subjectsList));
      setSubjects(subjectsList);
    }
  }, [branch, year]);

  // Fetch Modules from Supabase
  const handleSearch = async () => {
    setLoadingModules(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("modules")
      .eq("subject_name", subject);

    setLoadingModules(false);
    setModuleMessage("No videos available for the selected course");

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      localStorage.setItem("modules", JSON.stringify(data[0]?.modules));
      setModules(data[0]?.modules);
    }
  };

  useEffect(() => {
    setModules([]);
    setModuleMessage("Click on the search button!");
  }, [subject]);

  useEffect(() => {
    if (branch && year) {
      fetchSubjects();
    }
  }, [branch, year, fetchSubjects]);

  return (
    <div className="videos_page container mt-5">
      <h3 className="mb-4">Find course by</h3>
      <div className="row d-flex justify-content-center align-items-center">
        {/* Year Selection */}
        <div className="col-md-3 mt-1">
          <select
            className="form-select"
            id="select-year"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              localStorage.setItem("year", e.target.value);
              setBranch("");
              setSubject("");
            }}
          >
            <option value="" disabled>
              Select Year
            </option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selection */}
        <div className="col-md-3 mt-1">
          <select
            className="form-select"
            id="select-branch"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              localStorage.setItem("branch", e.target.value);
            }}
            disabled={!year}
          >
            <option value="" disabled>
              Select Branch
            </option>
            {branches.map((branch, index) => (
              <option key={index} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div className="col-md-3 mt-1">
          <select
            className="form-select"
            id="select-subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              localStorage.setItem("subject", e.target.value);
            }}
            disabled={!branch || !year}
          >
            <option value="" disabled>
              {loadingSubjects ? "Loading subjects..." : "Select Subject"}
            </option>
            {subjects.map((subj, index) => (
              <option key={index} value={subj.id}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="col-md-2 mt-1">
          <button
            className="btn btn-dark w-100"
            onClick={handleSearch}
            disabled={!subject}
          >
            {loadingModules ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Display Modules */}
      <div className="mt-5">
        {modules?.length > 0 ? (
          <div className="row">
            {modules.map((video, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{index + 1 + ". " + video}</h5>
                    <Link href={`/videos/${video.replaceAll(" ", "_")}`}>
                      <button className="btn btn-outline-dark">Learn..</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loadingModules && <p>{moduleMessage}</p>
        )}
        {user?.isAdmin && moduleMessage != "Click on the search button!" && (
          <InsertModuleBox
            modules={modules}
            subject={subject}
            setModules={setModules}
          />
        )}
      </div>
    </div>
  );
};

export default Videos;

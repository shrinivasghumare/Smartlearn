"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../_lib/supabaseClient"; // import supabase client
import LayoutContext from "../../context/LayoutContext";
import Link from "next/link";
import "./styles.css";
import "../../globals.css";

const Videos = () => {
  const LayoutProps = useContext(LayoutContext);
  LayoutProps.checkuser();

  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]); // fetched subjects
  const [videos, setVideos] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false); // subject loading state
  const [loadingVideos, setLoadingVideos] = useState(false); // video loading state

  const branches = ["CE", "AIDS", "ECS", "MECH"];
  const years = ["FE", "SE", "TE", "BE"];

  useEffect(() => {
    setBranch(localStorage.getItem("branch") || "");
    setYear(localStorage.getItem("year") || "");
    setSubject(localStorage.getItem("subject") || "");
    setSubjects(JSON.parse(localStorage.getItem("subjects")) || []);
    setVideos(JSON.parse(localStorage.getItem("videos")) || []);
  }, []);

  // Fetch subjects from Supabase
  const fetchSubjects = async () => {
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
      localStorage.setItem("subjects", JSON.stringify(data[0].subject));
      setSubjects(data[0].subject);
    }
  };

  // Fetch videos from Supabase
  const handleSearch = async () => {
    setLoadingVideos(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("modules")
      .eq("subject_name", subject); // assuming subject ID is stored

    setLoadingVideos(false);

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      console.log(data[0]);
      localStorage.setItem("videos", JSON.stringify(data[0]?.modules));
      setVideos(data[0]?.modules);
    }
  };

  useEffect(() => {
    if (branch && year) {
      fetchSubjects(); // fetch subjects when branch or year is selected
    }
  }, [branch, year]);

  return (
    <div className="videos_page container mt-5">
      <h3 className="mb-4">Find course by</h3>
      <div className="row">
        {/* Year Selection */}
        <div className="col-md-3">
          <select
            className="form-select"
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
        <div className="col-md-3">
          <select
            className="form-select"
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
        <div className="col-md-3">
          <select
            className="form-select"
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
        <div className="col-md-2">
          <button
            className="btn btn-primary w-100"
            onClick={handleSearch}
            disabled={!subject}
          >
            {loadingVideos ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Display Videos */}
      <div className="mt-5">
        {videos.length > 0 ? (
          <div className="row">
            {videos.map((video, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{index + 1 + ". " + video}</h5>
                    {/* <p className="card-text">
                      {subject} ({year})
                    </p> */}
                    {/* <p>This is a video player</p> */}
                    <Link
                      href={`/videos/${video.toString().replaceAll(" ", "_")}`}
                    >
                      <button className="btn btn-outline-primary">
                        Learn..
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loadingVideos && <p>No videos available for the selected course</p>
        )}
      </div>
    </div>
  );
};

export default Videos;

"use client";
import LayoutContext from "../../../context/LayoutContext";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../../_lib/supabaseClient";
import "../../../globals.css";

export default function Module({ params }) {
  const LayoutProps = useContext(LayoutContext);
  LayoutProps.checkuser();

  const [moduleLinks, setModuleLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState();
  useEffect(() => {
    setSubject(localStorage.getItem("subject") || null);
    const moduleName = params.module_name.replaceAll("_", " ");
    // Check if the links are already in localStorage
    const cachedModuleLinks = localStorage.getItem(
      `module_links_${params.module_name}`
    );

    if (cachedModuleLinks) {
      setModuleLinks(JSON.parse(cachedModuleLinks));
      setLoading(false);
    } else {
      // Fetch links from Supabase if not in localStorage
      const fetchModuleLinks = async () => {
        setLoading(true);

        const { data, error } = await supabase
          .from("modules")
          .select("module_link")
          .eq("module_name", moduleName)
          .single();

        if (error) {
          console.error("Error fetching module links:", error);
        } else {
          const links = data?.module_link;
          setModuleLinks(links);

          // Store the array of links in localStorage
          if (links) {
            localStorage.setItem(
              `module_links_${params.module_name}`,
              JSON.stringify(links)
            );
          }
        }

        setLoading(false);
      };

      fetchModuleLinks();
    }
  }, [params.module_name]);

  return (
    <div className="container">
      <h1 className="text-center">
        {subject + "-" + params.module_name.replaceAll("_", " ")}
      </h1>
      {loading ? (
        <div className="container text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading module links...</span>
          </div>
        </div>
      ) : moduleLinks.length > 0 ? (
        <div className="mt-4 container d-flex flex-wrap justify-content-center align-items-center">
          {moduleLinks.map((link, index) => (
            <div
              style={{
                backgroundColor: "whitesmoke",
                borderRadius: "1rem",
                width: "30rem",
              }}
              className={`video m-lg-3 m-md-3 my-3 p-3`}
              key={index}
            >
              <h3>Lecture-{index + 1}</h3>
              <hr />
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  paddingTop: "56.25%",
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                    link
                  )}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title={`YouTube video player ${index + 1}`}
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No videos found for this module.</p>
      )}
    </div>
  );
}

// Helper function to extract the YouTube video ID from the URL
function getYoutubeVideoId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

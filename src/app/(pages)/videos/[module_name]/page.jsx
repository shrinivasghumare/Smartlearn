"use client";
import { useState, useEffect, useContext } from "react";
import LayoutContext from "@context/LayoutContext";
import { supabase } from "../../../_lib/supabaseClient";
import "@/app/globals.css";

export default function Module({ params }) {
  const { user } = useContext(LayoutContext);
  const [moduleLinks, setModuleLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState();
  const [newLink, setNewLink] = useState(""); // State for new link input

  useEffect(() => {
    setSubject(localStorage.getItem("subject") || null);
    const moduleName = params.module_name.replaceAll("_", " ");
    const cachedModuleLinks = localStorage.getItem(
      `module_links_${params.module_name}`
    );

    if (cachedModuleLinks) {
      setModuleLinks(JSON.parse(cachedModuleLinks));
      setLoading(false);
    } else {
      const fetchModuleLinks = async () => {
        setLoading(true);

        const { data, error } = await supabase
          .from("video_modules")
          .select("module_link")
          .eq("module_name", moduleName)
          .single();

        if (!error) {
          const links = data?.module_link;
          setModuleLinks(links);

          if (links) {
            localStorage.setItem(
              `module_links_${params?.module_name}`,
              JSON.stringify(links)
            );
          }
        }

        setLoading(false);
      };

      fetchModuleLinks();
    }
  }, [params?.module_name]);

  // Function to handle adding a new module link
  const handleAddLink = async () => {
    if (!newLink) {
      alert("Please enter a valid link");
      return;
    }
    // Validate the new link using the provided regular expression
    const regExp =
      /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = newLink.match(regExp);
    if (!match) {
      alert("Please enter a valid YouTube link");
      return;
    }
    const module_name = params.module_name.replaceAll("_", " ");

    try {
      // Check if the module exists in the database
      const { data, error } = await supabase
        .from("video_modules")
        .select("module_link")
        .eq("module_name", module_name);

      if (error) {
        console.error("Error checking module:", error);
        return;
      }

      // If the module doesn't exist (returns an empty array), insert a new one
      if (data.length === 0) {
        const { data: insertData, error: insertError } = await supabase
          .from("video_modules")
          .insert([{ module_name: module_name, module_link: [newLink] }])
          .select();

        if (insertError) {
          console.error("Error inserting new module:", insertError);
        } else {
          setModuleLinks([newLink]);
          localStorage.setItem(
            `module_links_${params.module_name}`,
            JSON.stringify([newLink])
          );
          setNewLink(""); // Clear the input field
        }
      } else {
        // If the module exists, update the links array with the new link
        const updatedLinks = [...data[0].module_link, newLink];
        const { data: updateData, error: updateError } = await supabase
          .from("video_modules")
          .update({ module_link: updatedLinks })
          .eq("module_name", module_name)
          .select();

        if (updateError) {
          console.error("Error updating module links:", updateError);
        } else {
          setModuleLinks(updatedLinks); // Update state with new link
          localStorage.setItem(
            `module_links_${params.module_name}`,
            JSON.stringify(updatedLinks)
          );
          setNewLink(""); // Clear the input field
        }
      }
    } catch (err) {
      console.error("Error handling module link:", err);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center">
        {"(" + subject + ")" + "-" + params.module_name.replaceAll("_", " ")}
      </h1>
      {loading && <Loader />}
      {!loading && moduleLinks.length > 0 ? (
        <div className="mt-4 container d-flex flex-wrap justify-content-center align-items-center">
          {moduleLinks.map((link, index) => (
            <div
              key={index}
              className={`video m-lg-3 m-md-3 my-3 p-3`}
              style={{
                backgroundColor: "whitesmoke",
                borderRadius: "1rem",
                width: "30rem",
              }}
            >
              <h3>Lecture-{index + 1}</h3>
              <hr />
              <Video_Frame
                getYoutubeVideoId={getYoutubeVideoId}
                link={link}
                index={index}
              />
            </div>
          ))}
          {user?.isAdmin && (
            <AddNewVideo
              newLink={newLink}
              setNewLink={setNewLink}
              handleAddLink={handleAddLink}
            />
          )}
        </div>
      ) : (
        !loading && (
          <div className="mt-4 container d-flex flex-wrap justify-content-center align-items-center">
            <p style={{ width: "100%" }}>No videos found for this module.</p>
            <AddNewVideo
              newLink={newLink}
              setNewLink={setNewLink}
              handleAddLink={handleAddLink}
            />
          </div>
        )
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

function Loader({}) {
  return (
    <div className="container text-center my-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading module links...</span>
      </div>
    </div>
  );
}

function Video_Frame({ getYoutubeVideoId, link, index }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        paddingTop: "56.25%",
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${getYoutubeVideoId(link)}`}
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
  );
}

function AddNewVideo({ newLink, setNewLink, handleAddLink }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`video m-lg-3 m-md-3 my-3 p-3`}
      style={{
        backgroundColor: "whitesmoke",
        borderRadius: "1rem",
        width: "30rem",
      }}
    >
      <h3>Add New Video Link</h3>
      <hr />
      <input
        type="text"
        id="new-video"
        placeholder="Enter YouTube link"
        value={newLink}
        onChange={(e) => setNewLink(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        className="btn btn-dark w-100 mt-3"
        onClick={handleAddLink}
        type="submit"
        disabled={!newLink.trim()}
      >
        Add Link
      </button>
    </form>
  );
}

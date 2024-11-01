import { useEffect, useState } from "react";
import { supabase } from "@/app/_lib/supabaseClient";

const FileList = () => {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage
      .from("materials")
      .list("uploads");

    if (error) {
      console.error("Error fetching files:", error);
    } else {
      setFiles(data);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div>
      <h2>Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            <a
              href={`https://afmapfamqdsqcmakxzam.supabase.co/storage/v1/object/public/materials/uploads/${file.name}`}
            >
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;

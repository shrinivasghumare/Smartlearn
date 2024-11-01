"use client";
import UploadFile from "@/app/_components/notes_components/UploadFile";
import FileList from "@/app/_components/notes_components/FileList";
export default function page() {
  return (
    <div>
      <h1>File Upload and Retrieval</h1>
      <UploadFile />
      <FileList />
    </div>
  );
}

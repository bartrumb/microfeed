import React from 'react';
import { FileUploader } from "react-drag-drop-files";

type FileType = "JPG" | "PNG" | "GIF";

export default function FileUploaderTest(): JSX.Element {
  const fileTypes: FileType[] = ["JPG", "PNG", "GIF"];
  
  const handleChange = (file: File): void => {
    console.log(file);
  };

  return (
    <div>
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={fileTypes}
      />
    </div>
  );
}
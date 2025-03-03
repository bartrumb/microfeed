import React from 'react';
import { FileUploader } from "react-drag-drop-files";

export default function FileUploaderTest() {
  const fileTypes = ["JPG", "PNG", "GIF"];
  
  const handleChange = (file) => {
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
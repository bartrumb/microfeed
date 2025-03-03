import React from 'react';
import { FileUploader as BaseFileUploader } from "react-drag-drop-files";

// Wrapper component to handle the override prop correctly
export default function FileUploaderWrapper(props) {
  // Remove override prop and pass all other props through
  const { override: _, ...rest } = props;
  return (
    <BaseFileUploader
      {...rest}
    />
  );
}
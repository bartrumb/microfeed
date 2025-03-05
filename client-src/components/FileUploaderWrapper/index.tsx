import React from 'react';
import { FileUploader as BaseFileUploader } from "react-drag-drop-files";

interface FileUploaderWrapperProps {
  override?: boolean;
  [key: string]: any; // Allow any other props from BaseFileUploader
}

// Wrapper component to handle the override prop correctly
export default function FileUploaderWrapper(props: FileUploaderWrapperProps): JSX.Element {
  // Remove override prop and pass all other props through
  const { override: _, ...rest } = props;
  return (
    <BaseFileUploader
      {...rest}
    />
  );
}
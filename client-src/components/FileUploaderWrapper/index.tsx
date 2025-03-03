import React from 'react';
import { FileUploader as BaseFileUploader } from "react-drag-drop-files";

interface FileUploaderWrapperProps {
  handleChange: (file: File) => void;
  name: string;
  types: string[];
  disabled?: boolean;
  classes?: string;
  children?: React.ReactNode;
}

// Wrapper component to handle the override prop correctly
export default function FileUploaderWrapper(props: FileUploaderWrapperProps) {
  return (
    <BaseFileUploader
      {...props}
    />
  );
}
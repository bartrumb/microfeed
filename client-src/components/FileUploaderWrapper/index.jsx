import React from 'react';
import { FileUploader as BaseFileUploader } from "react-drag-drop-files";

// Wrapper component to handle the overRide prop correctly
export default function FileUploaderWrapper(props) {
  // Convert overRide to lowercase override
  const { overRide, ...rest } = props;
  return (
    <BaseFileUploader
      {...rest}
      override={overRide}
    />
  );
}
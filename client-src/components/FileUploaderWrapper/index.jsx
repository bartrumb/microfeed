import React from 'react';
import { FileUploader } from "react-drag-drop-files";

/**
 * Wrapper for FileUploader that handles prop filtering and styling
 * This prevents the overRide prop warning by properly handling props
 */
export default function FileUploaderWrapper(props) {
  // Filter out any props that might cause DOM warnings
  const {
    handleChange,
    name,
    types,
    disabled,
    classes,
    children,
    ...otherProps
  } = props;

  // Only pass valid props to FileUploader
  return (
    <FileUploader
      handleChange={handleChange}
      name={name}
      types={types}
      disabled={disabled}
      classes={classes}
      {...otherProps}
    >
      {children}
    </FileUploader>
  );
}
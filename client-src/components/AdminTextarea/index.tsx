import React from "react";
import clsx from "clsx";
import TextareaAutosize from 'react-textarea-autosize';

interface AdminTextareaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minRows?: number;
  maxRows?: number;
  customCss?: string;
  placeholder?: string;
  labelComponent?: React.ReactNode;
}

export default function AdminTextarea({ 
  label,
  value,
  onChange,
  minRows = 3,
  maxRows = 10,
  customCss = '',
  placeholder = '',
  labelComponent
}: AdminTextareaProps) {
  return (
    <label className="">
      {label && <div className="lh-page-subtitle">{label}</div>}
      {labelComponent}
      <div className="w-full">
        <TextareaAutosize
          className={clsx('w-full rounded', customCss)}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          minRows={minRows}
          maxRows={maxRows}
        />
      </div>
    </label>
  );
}

export type { AdminTextareaProps };
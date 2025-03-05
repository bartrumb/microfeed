import React from 'react';
import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor';

interface AdminCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string | number;
  width?: string | number;
  options?: MonacoEditorProps['options'];
  placeholder?: string;
}

export default function AdminCodeEditor({
  code,
  onChange,
  language = 'javascript',
  height = '500px',
  width = '100%',
  options = {},
  placeholder = ''
}: AdminCodeEditorProps): JSX.Element {
  const defaultOptions: MonacoEditorProps['options'] = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    theme: 'vs-dark',
    minimap: {
      enabled: false
    },
    ...options
  };

  return (
    <MonacoEditor
      width={width}
      height={height}
      language={language}
      theme="vs-dark"
      value={code || placeholder}
      options={defaultOptions}
      onChange={onChange}
    />
  );
}
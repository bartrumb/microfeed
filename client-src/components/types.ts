import { ReactNode } from 'react';

// Define a more specific type for label components
export type LabelComponent = ReactNode;
export type LabelComponentProp = ReactNode;

export interface LabelProps {
  label?: string;
  labelComponent?: ReactNode | null | undefined;
}

export interface BaseInputProps extends LabelProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface BaseTextareaProps extends LabelProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface BaseSelectProps extends LabelProps {
  value: any;
  options: any[];
  onChange: (selected: any) => void;
}

export interface ExplainBundle {
  linkName: string;
  modalTitle?: string;
  text: string;
  rss?: string;
  json?: string;
}

export type LabelRenderer = (bundle: ExplainBundle | null) => ReactNode | null | undefined;
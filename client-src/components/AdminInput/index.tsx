import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";
import { enhanceFieldAccessibility } from "../../common/AccessibilityUtils";

interface AdminInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelComponent?: JSX.Element;
  placeholder?: string;
  disabled?: boolean;
  setRef?: () => void;
  customLabelClass?: string;
  customClass?: string;
  type?: string;
  extraParams?: Record<string, unknown>;
}

interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  disabled: boolean;
}

const AdminInput: React.FC<AdminInputProps> = ({
  label,
  value,
  onChange,
  labelComponent,
  placeholder = '',
  disabled = false,
  setRef = () => {},
  customLabelClass = '',
  customClass = '',
  type = 'text',
  extraParams = {}
}) => {
  const inputProps = enhanceFieldAccessibility({
    type,
    placeholder,
    value: value || '',
    onChange,
    className: clsx(
      'w-full rounded',
      customClass || 'text-sm',
      disabled && 'bg-gray-100'
    ),
    disabled,
    ...extraParams
  }, 'input') as EnhancedInputProps;

  return (
    <label className="w-full">
      {label && <div className={clsx(customLabelClass || "lh-page-subtitle")}>{label}</div>}
      {labelComponent}
      <div className="w-full relative">
        <input {...inputProps} />
      </div>
    </label>
  );
};

export default AdminInput;
export type { AdminInputProps };
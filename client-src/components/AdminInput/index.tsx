import React from "react";
import clsx from "clsx";
import { enhanceFieldAccessibility } from "../../common/AccessibilityUtils";
import { BaseInputProps } from "../types";

interface AdminInputProps extends Omit<BaseInputProps, 'labelComponent'> {
  placeholder?: string;
  disabled?: boolean;
  setRef?: (ref: HTMLInputElement) => void;
  customLabelClass?: string;
  customClass?: string;
  type?: string;
  extraParams?: Record<string, any>;
  labelComponent?: React.ReactNode | null | undefined;
}

export default function AdminInput({
  label,
  value,
  onChange,
  labelComponent = null,
  placeholder = '',
  disabled = false,
  setRef = () => {},
  customLabelClass = '',
  customClass = '',
  type = 'text',
  extraParams = {}
}: AdminInputProps): JSX.Element {
  return (
    <label className="w-full">
      {label && <div className={clsx(customLabelClass || "lh-page-subtitle")}>{label}</div>}
      {labelComponent}
      <div className="w-full relative">
        <input
          {...enhanceFieldAccessibility({
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
          }, 'input')}
          ref={setRef}
        />
      </div>
    </label>
  );
}
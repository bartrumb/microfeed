import React from "react";
import clsx from "clsx";
import { enhanceFieldAccessibility } from "../../common/AccessibilityUtils";

export default function AdminInput(
  { label, value, onChange, labelComponent = null, placeholder = '', disabled = false,
    setRef = () => {}, customLabelClass = '', customClass = '', type = 'text',
    extraParams = {} }) {
  return (<label className="w-full">
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
      />
    </div>
  </label>);
}

import React from "react";
import clsx from "clsx";

interface RadioButton {
  name: string;
  value?: string;
  checked: boolean;
}

interface AdminRadioProps {
  label?: string;
  groupName: string;
  buttons: RadioButton[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelComponent?: React.ReactNode | null | undefined;
  disabled?: boolean;
  customLabelClass?: string;
  customClass?: string;
}

export default function AdminRadio({
  label,
  groupName,
  buttons,
  onChange,
  labelComponent = null,
  disabled = false,
  customLabelClass = '',
  customClass = ''
}: AdminRadioProps): JSX.Element {
  return (
    <fieldset className={clsx("flex flex-col justify-start", customClass)}>
      {label && <legend className={clsx(customLabelClass || 'lh-page-subtitle')}>{label}</legend>}
      {labelComponent}
      <div className="w-full flex">
        {buttons.map((b) => (
          <label key={`${groupName}-${b.name}`} className="mr-4 flex items-center">
            <input
              type="radio"
              name={groupName}
              value={b.value || b.name}
              checked={b.checked}
              onChange={(e) => {
                onChange(e);
              }}
              className="text-brand-light"
              disabled={disabled}
            />
            <div className={clsx('ml-1.5', b.checked ? '' : 'text-helper-color')}>{b.name}</div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
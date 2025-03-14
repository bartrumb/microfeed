import React from "react";
import Select from 'react-select';

interface AdminSelectProps {
  label?: string;
  value: any;
  options: any[];
  onChange: (selected: any) => void;
  extraParams?: Record<string, any>;
  labelComponent?: React.ReactNode | null | undefined;
}

export default function AdminSelect({
  label,
  value,
  options,
  onChange,
  extraParams = {},
  labelComponent = null
}: AdminSelectProps): JSX.Element {
  return (
    <label className="">
      {label && <div className="lh-page-subtitle">{label}</div>}
      {labelComponent}
      <div className="w-full">
        <Select
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: state.isFocused ? 'grey' : 'black',
              borderRadius: 4,
            }),
          }}
          className="text-sm"
          value={value}
          options={options}
          onChange={onChange}
          {...extraParams}
        />
      </div>
    </label>
  );
}
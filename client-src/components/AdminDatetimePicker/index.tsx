import React from "react";
import { msToDatetimeLocalString, datetimeLocalToString } from '../../../common-src/TimeUtils';
import { LabelProps } from "../types";

interface AdminDatetimePickerProps extends LabelProps {
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AdminDatetimePicker({ 
  label, 
  value, 
  onChange, 
  labelComponent = null 
}: AdminDatetimePickerProps): JSX.Element {
  const formatValue = () => {
    if (!value) {
      return datetimeLocalToString(new Date());
    }
    return typeof value === 'number' 
      ? msToDatetimeLocalString(value)
      : value;
  };

  return (
    <label className="">
      {label && <div className="lh-page-subtitle">{label}</div>}
      {labelComponent}
      <div className="w-full">
        <input
          type="datetime-local"
          value={formatValue()}
          className="w-full text-sm rounded"
          onChange={onChange}
        />
      </div>
    </label>
  );
}
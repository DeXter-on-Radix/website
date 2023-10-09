import React, { ReactNode } from "react";
import { ValidationResult } from "redux/orderInputSlice";

type Props = Omit<JSX.IntrinsicElements["input"], "className"> & {
  parentClasses?: string;
  inputClasses?: string;
  endAdornmentClasses?: string;
  endAdornment?: ReactNode;
  validation?: ValidationResult;
};

export const Input = ({
  parentClasses = "",
  inputClasses = "",
  endAdornment,
  endAdornmentClasses = "",
  validation,
  ...inputProps
}: Props) => {
  const isError = validation?.valid === false;
  return (
    <>
      <div
        className={
          "flex flex-row items-center bg-base-300 " +
          (isError ? "border border-error " : "") +
          parentClasses
        }
      >
        <input
          className={"input w-full px-2 border-0 " + inputClasses}
          {...inputProps}
        />
        {endAdornment && (
          <div className={"px-3 " + endAdornmentClasses}>{endAdornment}</div>
        )}
      </div>
      <label className="label">
        <span className="label-text-alt text-error">{validation?.message}</span>
      </label>
    </>
  );
};

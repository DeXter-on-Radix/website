import React, { ReactNode } from "react";

type Props = Omit<JSX.IntrinsicElements["input"], "className"> & {
  parentClasses?: string;
  inputClasses?: string;
  endAdornmentClasses?: string;
  endAdornment?: ReactNode;
  isError?: boolean;
};

export const Input = ({
  parentClasses = "",
  inputClasses = "",
  endAdornment,
  isError = false,
  endAdornmentClasses = "",
  ...inputProps
}: Props) => {
  return (
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
  );
};

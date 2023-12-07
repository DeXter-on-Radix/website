import "react";

export function BottomRightErrorLabel(props: { message: string }) {
  return (
    <label className="label justify-end pt-0">
      <span className="label-text-alt text-error text-end">
        {props.message}
      </span>
    </label>
  );
}

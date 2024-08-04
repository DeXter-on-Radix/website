interface IProps {
  width?: string;
  height?: string;
  className?: string;
}

export const SkeletonRectangle = ({
  width = "w-20",
  height = "h-16",
  className = "bg-white/10",
}: IProps) => {
  return (
    <div
      className={`skeleton ${className} ${height} ${width} rounded-lg`}
    ></div>
  );
};

export const SkeletonCircle = ({
  width = "w-16",
  height = "h-16",
  className = "bg-white/10",
}: IProps) => {
  return (
    <div
      className={`skeleton ${className} ${width} ${height} shrink-0 rounded-full`}
    ></div>
  );
};

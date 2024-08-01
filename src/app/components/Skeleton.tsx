interface IProps {
  width?: string;
  height?: string;
}

export const SkeletonRectangle = ({
  width = "w-20",
  height = "h-16",
}: IProps) => {
  return <div className={`skeleton ${height} ${width} rounded-lg`}></div>;
};

export const SkeletonCircle = ({ width = "w-16", height = "h-16" }: IProps) => {
  return (
    <div className={`skeleton ${width} ${height} shrink-0 rounded-full`}></div>
  );
};

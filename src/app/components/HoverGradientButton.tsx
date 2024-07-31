"use client";

interface IProps {
  handleClick?: () => void;
  label: string;
}

const HoverGradientButton = ({ handleClick = () => {}, label }: IProps) => {
  return (
    <button
      onClick={handleClick}
      className="whitespace-nowrap text-sm font-bold hover:text-dexter-gradient-green"
    >
      {label}
    </button>
  );
};

export default HoverGradientButton;

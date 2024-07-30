import CountUp from "react-countup";

type TProps = {
  wrapperClassName?: string;
  counterClassName?: string;
  labelClassName?: string;
  label?: React.ReactNode;
  start?: number;
  end: number;
  duration?: number;
  separator?: string;
  decimals?: number;
  decimal?: string;
  prefix?: string;
  suffix?: string;
  enableScrollSpy?: boolean;
  scrollSpyDelay?: number;
  delay?: number;
};

const AnimatedCounter = ({
  wrapperClassName = "",
  counterClassName = "",
  labelClassName = "",
  label,
  start = 0,
  end,
  duration = 5,
  separator = " ",
  decimals = 4,
  decimal = ",",
  prefix = "",
  suffix = "",
  enableScrollSpy = true,
  scrollSpyDelay = 0,
  delay = 0,
}: TProps) => {
  return (
    <div className={wrapperClassName}>
      <CountUp
        start={start}
        end={end}
        duration={duration}
        separator={separator}
        decimals={decimals}
        decimal={decimal}
        prefix={prefix}
        suffix={suffix}
        enableScrollSpy={enableScrollSpy} // enable scroll spy functionality (using Intersection Observer). Default is `true`.
        scrollSpyDelay={scrollSpyDelay}
        delay={delay}
      >
        {({ countUpRef }) => {
          return <span ref={countUpRef} className={counterClassName} />;
        }}
      </CountUp>

      {label && <span className={labelClassName}>{label}</span>}
    </div>
  );
};

export default AnimatedCounter;

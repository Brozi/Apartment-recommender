import type { SVGProps } from "react";

type ChevronDownIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export default function ChevronDownIcon({
  size = 24,
  color = "var(--clr-primary-100)",
}: ChevronDownIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.9998 5C13.1975 5.00004 13.3908 5.05871 13.5552 5.1686C13.7197 5.27848 13.8478 5.43465 13.9235 5.61735C13.9991 5.80005 14.0189 6.00108 13.9804 6.19503C13.9418 6.38898 13.8466 6.56715 13.7068 6.707L8.70679 11.707C8.51926 11.8945 8.26495 11.9998 7.99979 11.9998C7.73462 11.9998 7.48031 11.8945 7.29279 11.707L2.29279 6.707C2.15298 6.56715 2.05777 6.38898 2.0192 6.19503C1.98064 6.00108 2.00044 5.80005 2.07611 5.61735C2.15178 5.43465 2.27992 5.27848 2.44433 5.1686C2.60874 5.05871 2.80204 5.00004 2.99979 5H12.9998Z"
        fill={color}
      />
    </svg>
  );
}

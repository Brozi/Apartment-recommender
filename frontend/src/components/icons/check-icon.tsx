import type { SVGProps } from "react";

type CheckIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export default function CheckIcon({
  size = 24,
  className,
  strokeWidth = 2.5,
}: CheckIconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      color="currentColor"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M5 13.2592L7.58583 15.9568C8.2525 16.6523 8.58583 17.0001 9.00004 17.0001C9.41425 17.0001 9.74759 16.6523 10.4143 15.9568L19 7.00006"></path>
    </svg>
  );
}

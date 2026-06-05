import type { SVGProps } from "react";

type CloseIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function CloseIcon({
  size = 24,
  color = "var(--clr-primary-100)",
  strokeWidth = 2.5,
}: CloseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      color={color}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085"></path>
    </svg>
  );
}

import type { SVGProps } from "react";

type SelectArrowIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export default function SelectArrowIcon({
  size = 16,
  color = "var(--clr-primary-100)",
}: SelectArrowIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.9998 4.99997C13.1975 5.00001 13.3908 5.05868 13.5552 5.16857C13.7197 5.27845 13.8478 5.43462 13.9235 5.61732C13.9991 5.80001 14.0189 6.00105 13.9804 6.195C13.9418 6.38895 13.8466 6.56712 13.7068 6.70697L8.70679 11.707C8.51926 11.8944 8.26495 11.9998 7.99979 11.9998C7.73462 11.9998 7.48031 11.8944 7.29279 11.707L2.29279 6.70697C2.15298 6.56712 2.05777 6.38895 2.0192 6.195C1.98064 6.00105 2.00044 5.80001 2.07611 5.61732C2.15178 5.43462 2.27992 5.27845 2.44433 5.16857C2.60874 5.05868 2.80204 5.00001 2.99979 4.99997H12.9998Z"
        fill={color}
      />
    </svg>
  );
}

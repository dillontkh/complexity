import type { SVGProps } from "react";

const StabilityAiIcon = ({ style, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.8em"
    height="0.8em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 213"
    style={{
      filter: "grayscale(100%)",
      ...style,
    }}
    {...props}
  >
    <defs>
      <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="currentColor" />
        <stop offset="100%" stopColor="currentColor" />
      </linearGradient>
    </defs>
    <path
      fill="currentColor"
      d="M72.418 212.45c49.478 0 81.658-26.205 81.658-65.626 0-30.572-19.572-49.998-54.569-58.043l-22.469-6.74c-19.71-4.424-31.215-9.738-28.505-23.312 2.255-11.292 9.002-17.667 24.69-17.667 49.872 0 68.35 17.667 68.35 17.667V16.237S123.583 0 73.223 0C25.757 0 0 24.424 0 62.236c0 30.571 17.85 48.35 54.052 56.798 2.534.633 3.83.959 3.885.976 5.507 1.704 12.938 3.956 22.293 6.755 18.504 4.425 23.262 9.121 23.262 23.2 0 12.872-13.374 20.19-31.074 20.19C21.432 170.154 0 144.36 0 144.36v47.078s13.402 21.01 72.418 21.01Z"
    />
    <path
      fill="currentColor"
      d="M225.442 209.266c17.515 0 30.558-12.67 30.558-29.812 0-17.515-12.67-29.813-30.558-29.813-17.515 0-30.185 12.298-30.185 29.813s12.67 29.812 30.185 29.812Z"
    />
  </svg>
);
export default StabilityAiIcon;
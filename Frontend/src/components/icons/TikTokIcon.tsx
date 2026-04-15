
import React from 'react';

const TikTokIcon = ({ size = 24, color = 'currentColor', ...props }: { 
  size?: number | string; 
  color?: string;
  [key: string]: any;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
};

export default TikTokIcon;

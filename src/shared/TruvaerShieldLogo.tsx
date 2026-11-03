import React from 'react';

interface TruvaerShieldLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
  inverted?: boolean;
}

export const TruvaerShieldLogo: React.FC<TruvaerShieldLogoProps> = ({
  className = 'w-10 h-10',
  size,
  color,
  inverted = false,
}) => {
  // TruvAer official aerodynamic shield emblem with transparent background
  const fillColor = color || (inverted ? '#FFFFFF' : 'currentColor');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="TruvAer Logo"
    >
      {/* Path 1: Top-Left Notched Shoulder Wing */}
      <path
        d="M 108 132 L 234 96 L 234 165 L 160 165 L 160 220 L 120 220 C 115 188 111 156 108 132 Z"
        fill={fillColor}
      />

      {/* Path 2: Central Aerodynamic S-Ribbon Blade */}
      <path
        d="M 256 96 C 272 98 288 103 288 103 C 266 148 236 195 220 236 C 204 278 214 304 248 328 L 222 348 C 176 314 168 254 194 198 C 215 152 238 118 256 96 Z"
        fill={fillColor}
      />

      {/* Path 3: Upper-Right Swept Winglet */}
      <path
        d="M 330 118 L 370 134 C 354 178 334 220 288 248 L 268 230 C 304 206 324 168 330 118 Z"
        fill={fillColor}
      />

      {/* Path 4: Lower Shield Rim with Sharp Base V-Apex */}
      <path
        d="M 124 238 C 140 312 184 370 250 412 C 316 370 360 312 376 238 L 342 220 C 330 282 296 332 250 366 C 204 332 170 282 158 220 Z"
        fill={fillColor}
      />
    </svg>
  );
};

export default TruvaerShieldLogo;

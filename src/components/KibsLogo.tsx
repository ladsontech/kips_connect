import React from 'react';

interface KibsLogoProps {
  variant?: 'full' | 'badge';
  className?: string;
  badgeSize?: number;
}

export const KibsLogo: React.FC<KibsLogoProps> = ({
  variant = 'full',
  className = '',
  badgeSize = 40,
}) => {
  if (variant === 'badge') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        style={{ width: badgeSize, height: badgeSize }}
        aria-label="Kibs Systems Ltd Emblem"
        role="img"
      >
        <circle cx="50" cy="50" r="48" fill="#15803d" />
        <circle cx="50" cy="50" r="45" fill="#16a34a" />
        <circle cx="50" cy="50" r="45" stroke="#14532d" strokeWidth="2.5" />
        <g transform="translate(14, 13) scale(0.95)">
          <path
            d="M20 16 C22 28, 22 46, 17 62 C16 65, 17 68, 21 66 C26 63, 29 48, 30 38 C32 30, 31 22, 28 17 C26 13, 20 13, 20 16 Z"
            fill="#09090b"
          />
          <path
            d="M28 35 C33 30, 42 22, 53 17 C57 15, 60 18, 56 22 C48 28, 39 36, 31 43 Z"
            fill="#09090b"
          />
          <path
            d="M26 39 C34 45, 45 55, 52 64 C55 68, 51 70, 47 67 C41 61, 32 50, 24 43 Z"
            fill="#09090b"
          />
          <text
            x="39"
            y="42"
            fill="#ffffff"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="900"
            fontSize="22"
            textAnchor="middle"
            style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}
          >
            S
          </text>
          <text
            x="42"
            y="60"
            fill="#ffffff"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="900"
            fontSize="18"
            textAnchor="middle"
            style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}
          >
            L
          </text>
        </g>
      </svg>
    );
  }

  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 530 92"
        className="h-full w-auto max-w-full drop-shadow-xs"
        aria-label="Kibs Systems Ltd Logo"
        role="img"
      >
        <g transform="translate(6, 4)">
          {/* Pill frame */}
          <rect
            x="54"
            y="8"
            width="455"
            height="46"
            rx="23"
            fill="#ffffff"
            stroke="#16a34a"
            strokeWidth="3.5"
          />
          
          {/* Red Company Name */}
          <text
            x="281"
            y="40"
            fill="#dc2626"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="27"
            letterSpacing="0.07em"
            textAnchor="middle"
          >
            KIBS SYSTEMS LTD
          </text>

          {/* Tagline */}
          <text
            x="281"
            y="72"
            fill="#1e293b"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontWeight="600"
            fontSize="13.5"
            letterSpacing="0.015em"
            textAnchor="middle"
          >
            Integrating Technology to your security needs
          </text>

          {/* Circular Badge on Left */}
          <g transform="translate(2, -1)">
            <circle cx="40" cy="40" r="40" fill="#15803d" />
            <circle cx="40" cy="40" r="37.5" fill="#16a34a" />
            <circle cx="40" cy="40" r="37.5" stroke="#14532d" strokeWidth="2" />
            
            <g transform="translate(2, 2)">
              <path
                d="M20 16 C22 28, 22 46, 17 62 C16 65, 17 68, 21 66 C26 63, 29 48, 30 38 C32 30, 31 22, 28 17 C26 13, 20 13, 20 16 Z"
                fill="#09090b"
              />
              <path
                d="M28 35 C33 30, 42 22, 53 17 C57 15, 60 18, 56 22 C48 28, 39 36, 31 43 Z"
                fill="#09090b"
              />
              <path
                d="M26 39 C34 45, 45 55, 52 64 C55 68, 51 70, 47 67 C41 61, 32 50, 24 43 Z"
                fill="#09090b"
              />

              <text
                x="39"
                y="42"
                fill="#ffffff"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="900"
                fontSize="22"
                textAnchor="middle"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}
              >
                S
              </text>

              <text
                x="42"
                y="59"
                fill="#ffffff"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="900"
                fontSize="17.5"
                textAnchor="middle"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}
              >
                L
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

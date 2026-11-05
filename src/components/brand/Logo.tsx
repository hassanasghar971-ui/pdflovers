import { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className }: LogoMarkProps) {
  const gid = `lg${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0504b" />
          <stop offset="1" stopColor="#c71f1b" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gid})`} />
      <g transform="translate(256 256) translate(-254 -268)">
        <path d="M160 92h150l62 62v266a24 24 0 0 1-24 24H160a24 24 0 0 1-24-24V116a24 24 0 0 1 24-24z" fill="#fff" />
        <path d="M310 92v62h62z" fill="#f9c9c7" />
        <rect x="176" y="186" width="120" height="16" rx="8" fill="#f3d0ce" />
        <rect x="176" y="218" width="84" height="16" rx="8" fill="#f3d0ce" />
        <path
          transform="translate(188 233) scale(5.5)"
          fill="#c71f1b"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </g>
    </svg>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
}

/** Mark + wordmark. Wrap it in a <Link href="/"> in the header. */
export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-lg font-extrabold tracking-tight text-slate-900">
        PDF <span className="text-brand-600">Lovers</span> Pro
      </span>
    </span>
  );
}

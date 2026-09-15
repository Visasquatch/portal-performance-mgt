interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function dims(size?: number) {
  return {
    width: size ?? 17,
    height: size ?? 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
  } as const;
}

export function OverviewIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function CollectionIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export function RemittanceIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}

export function TradeIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </svg>
  );
}

export function SettingsIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <line x1="3" y1="7" x2="21" y2="7" />
      <circle cx="9" cy="7" r="2.5" />
      <line x1="3" y1="17" x2="21" y2="17" />
      <circle cx="16" cy="17" r="2.5" />
    </svg>
  );
}

export function SignOutIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function MenuIcon({ size }: IconProps) {
  return (
    <svg {...dims(size)}>
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export function USFlagIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 10) / 19)}
      viewBox="0 0 19 10"
      aria-label="US flag"
      style={{ boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,.25)', borderRadius: 1 }}
    >
      {[0, 2, 4, 6, 8, 10, 12].map((r, i) => (
        <rect key={i} x="0" y={(r * 10) / 13} width="19" height={10 / 13} fill="#b22234" />
      ))}
      <rect x="0" y="0" width="7.6" height={(10 * 7) / 13} fill="#3c3b6e" />
      {[
        [1.15, 0.95],
        [2.85, 0.95],
        [1.15, 2.65],
        [2.85, 2.65],
        [1.15, 4.35],
        [2.85, 4.35],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.52" fill="#fff" />
      ))}
    </svg>
  );
}

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 5; k++) {
    const a1 = ((-90 + k * 72) * Math.PI) / 180;
    const a2 = ((-90 + k * 72 + 36) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a1)).toFixed(2)},${(cy + r * Math.sin(a1)).toFixed(2)}`);
    pts.push(`${(cx + r * 0.45 * Math.cos(a2)).toFixed(2)},${(cy + r * 0.45 * Math.sin(a2)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function flagBox(size: number) {
  return {
    width: size,
    height: Math.round((size * 10) / 19),
    viewBox: '0 0 19 10',
    style: { boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,.25)', borderRadius: 1 },
  } as const;
}

export function CurrencyFlag({ code, size = 19 }: { code: string; size?: number }) {
  const b = flagBox(size);
  switch (code) {
    case 'NGN':
      return (
        <svg {...b}>
          <rect width="19" height="10" fill="#008751" />
          <rect x="6.3" width="6.4" height="10" fill="#fff" />
        </svg>
      );
    case 'GHS':
      return (
        <svg {...b}>
          <rect width="19" height="10" fill="#fcd116" />
          <rect width="19" height="3.33" fill="#ce1126" />
          <rect y="6.67" width="19" height="3.33" fill="#006b3f" />
          <polygon points={star(9.5, 5, 1.45)} fill="#000" />
        </svg>
      );
    case 'KES':
      return (
        <svg {...b}>
          <rect width="19" height="10" fill="#fff" />
          <rect width="19" height="3.1" fill="#006600" />
          <rect y="3.7" width="19" height="2.6" fill="#b30000" />
          <rect y="6.9" width="19" height="3.1" fill="#006600" />
          <circle cx="9.5" cy="5" r="1.7" fill="#fff" stroke="#111" strokeWidth="0.35" />
          <path d="M8.4 3.9 h2.2 v1.2 h-2.2 z" fill="#111" />
          <path d="M8.4 5.6 h2.2 v0.6 h-2.2 z" fill="#b30000" />
        </svg>
      );
    case 'ZAR':
      return (
        <svg {...b}>
          <rect width="19" height="10" fill="#fff" />
          <rect width="19" height="3.4" fill="#e03c31" />
          <rect y="6.6" width="19" height="3.4" fill="#001489" />
          <polygon points="0,2.1 2.2,2.6 19,1.2 19,3.0 11.5,5 19,7.0 19,8.8 2.2,7.4 0,7.9" fill="#007a4d" />
          <polygon
            points="0,2.1 2.2,2.6 19,1.2 19,3.0 11.5,5 19,7.0 19,8.8 2.2,7.4 0,7.9"
            fill="none"
            stroke="#ffb81c"
            strokeWidth="0.5"
          />
          <polygon points="0,3.2 0,6.8 2.6,5" fill="#111" />
        </svg>
      );
    case 'XAF':
      return (
        <svg {...b}>
          <rect width="19" height="10" fill="#007a5e" />
          <rect x="6.3" width="6.4" height="10" fill="#ce1126" />
          <rect x="12.7" width="6.3" height="10" fill="#fcd116" />
          <polygon points={star(9.5, 5, 1.6)} fill="#fcd116" />
        </svg>
      );
    case 'EGP':
      return (
        <svg {...b}>
          <rect width="19" height="10" fill="#fff" />
          <rect width="19" height="3.33" fill="#ce1126" />
          <rect y="6.67" width="19" height="3.33" fill="#000" />
          <circle cx="9.5" cy="5" r="1.15" fill="#c09300" />
        </svg>
      );
    case 'USDT':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="9.6" fill="#26a17b" />
          <text
            x="10"
            y="14.6"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#fff"
            fontFamily="var(--font-heading)"
          >
            ₮
          </text>
        </svg>
      );
    case 'USD':
    default:
      return <USFlagIcon size={size} />;
  }
}
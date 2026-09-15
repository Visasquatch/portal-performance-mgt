export function usd(n: number, dec?: number): string {
  const d = dec == null ? 0 : dec;
  return (
    '$' +
    Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })
  );
}

export function compact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return '$' + Math.round(n / 1e3).toLocaleString('en-US') + 'K';
  return usd(n);
}

export function compactN(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e4) return Math.round(n / 1e3).toLocaleString('en-US') + 'K';
  return Number(n).toLocaleString('en-US');
}

export function num(n: number): string {
  return Number(n || 0).toLocaleString('en-US');
}

export function flag(c: string): string {
  return (
    {
      USD: '🇺🇸',
      NGN: '🇳🇬',
      GHS: '🇬🇭',
      KES: '🇰🇪',
      ZAR: '🇿🇦',
      XAF: '🇨🇲',
      EGP: '🇪🇬',
      USDT: '₮',
    }[c] || ''
  );
}

export function deltaChip(v: number): {
  arrow: string;
  pct: string;
  bg: string;
  fg: string;
} {
  const up = v >= 0;
  return {
    arrow: up ? '▲' : '▼',
    pct: Math.abs(v).toFixed(1) + '%',
    bg: up ? '#e6f6ee' : '#fdecea',
    fg: up ? '#1e7a52' : '#c0392b',
  };
}

export function deltaText(v: number): { text: string; fg: string } {
  const c = deltaChip(v);
  return { text: c.arrow + ' ' + c.pct + ' vs prev', fg: c.fg };
}
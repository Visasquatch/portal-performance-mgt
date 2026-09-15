import { deltaChip } from '../lib/format';

export function DeltaChip({ v, small = false }: { v: number; small?: boolean }) {
  const c = deltaChip(v);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: small ? '2px 8px' : '3px 9px',
        borderRadius: 4,
        background: c.bg,
        color: c.fg,
        fontSize: small ? 13 : 14,
      }}
    >
      {c.arrow} {c.pct}
    </span>
  );
}

export function DeltaText({ v }: { v: number }) {
  const c = deltaChip(v);
  return (
    <span style={{ color: c.fg }}>
      {c.arrow} {c.pct} vs prev
    </span>
  );
}
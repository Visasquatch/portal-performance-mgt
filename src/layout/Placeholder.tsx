import type { ReactNode } from 'react';

export function Placeholder({
  title,
  note,
}: {
  title: string;
  note: ReactNode;
}) {
  return (
    <div className="page">
      <div className="placeholder-card">
        <span
          className="tag tag-accent"
          style={{ borderRadius: 4, marginBottom: 14, display: 'inline-block' }}
        >
          Next build checkpoint
        </span>
        <h4 style={{ margin: '0 0 4px' }}>{title}</h4>
        <p
          className="text-muted"
          style={{ fontSize: 14, margin: 0, marginBottom: 16 }}
        >
          {note}
        </p>
        <div
          style={{
            width: 48,
            height: 4,
            borderRadius: 2,
            background: 'var(--color-accent-200)',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
}
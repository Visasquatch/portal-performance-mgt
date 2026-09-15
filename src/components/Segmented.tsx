import type { ReactNode } from 'react';

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      className="seg"
      style={{
        background: 'var(--color-neutral-100)',
        borderColor: 'var(--color-neutral-200)',
      }}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            className="seg-opt"
            style={{
              border: '0',
              ...(i > 0
                ? { borderLeft: '1px solid var(--color-neutral-200)' }
                : {}),
              font: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              background: selected ? 'var(--color-accent)' : 'transparent',
              color: selected ? '#ffffff' : 'var(--color-text)',
            }}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
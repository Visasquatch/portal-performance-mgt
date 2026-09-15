import { useEffect, useRef, useState } from 'react';
import { CurrencyFlag } from './icons';

export function CurrencySelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div className="field" ref={ref}>
      <label>{label}</label>
      <div className="currency-wrap">
        <button type="button" className="currency-trigger" onClick={() => setOpen((o) => !o)}>
          <CurrencyFlag code={value} />
          <span style={{ flex: 1 }}>{value}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--color-neutral-500)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div className="currency-menu">
            {options.map((c) => (
              <button
                type="button"
                key={c}
                className={c === value ? 'sel' : ''}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
              >
                <CurrencyFlag code={c} />
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
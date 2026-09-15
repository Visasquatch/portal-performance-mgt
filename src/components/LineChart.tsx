import { useLayoutEffect, useMemo, useState } from 'react';
import { buildLine } from '../lib/charts';
import { usd } from '../lib/format';

interface LineChartProps {
  values: number[];
  labels: string[];
  width?: number;
  height: number;
  padL?: number;
  padB?: number;
  gradientId?: string;
  showTooltip?: boolean;
  showAxisL?: boolean;
}

export function LineChart({
  values,
  labels,
  width = 720,
  height,
  padL = 76,
  padB = 30,
  gradientId = 'bpFill',
  showTooltip = true,
  showAxisL = true,
}: LineChartProps) {
  const [hover, setHover] = useState(-1);

  useLayoutEffect(() => {
    setHover(-1);
  }, [values]);

  const g = useMemo(
    () => buildLine(values, labels, width, height, { padL, padB }),
    [values, labels, width, height, padL, padB],
  );

  const step = g.pts.length > 1 ? g.pts[1].x - g.pts[0].x : 60;
  const hp = g.pts[hover];

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        fill="none"
        onMouseLeave={() => setHover(-1)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity=".26" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {g.yTicks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y}
            x2={t.x2}
            y2={t.y}
            stroke="var(--color-neutral-200)"
            strokeWidth={1}
          />
        ))}
        {showAxisL && (
          <line
            x1={g.padL}
            y1={12}
            x2={g.padL}
            y2={g.baseY}
            stroke="var(--color-neutral-400)"
            strokeWidth={1}
          />
        )}
        <line
          x1={g.padL}
          y1={g.baseY}
          x2={g.right}
          y2={g.baseY}
          stroke="var(--color-neutral-400)"
          strokeWidth={1}
        />
        <path d={g.area} fill={`url(#${gradientId})`} />
        <path
          d={g.path}
          stroke="var(--color-accent)"
          strokeWidth={2.25}
          strokeLinejoin="round"
        />
        {g.pts.map((p) => (
          <g key={p.i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === p.i ? 5 : 3.5}
              fill="#ffffff"
              stroke="var(--color-accent)"
              strokeWidth={2}
            />
            <rect
              x={p.x - step / 2}
              y={0}
              width={step}
              height={g.baseY}
              fill="transparent"
              onMouseEnter={
                showTooltip ? () => setHover(p.i) : undefined
              }
            />
          </g>
        ))}
      </svg>

      {g.yLab.map((t, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            textAlign: 'right',
            fontSize: 13,
            color: 'var(--color-neutral-700)',
            transform: 'translateY(-50%)',
            left: 0,
            paddingRight: 10,
            width: t.w,
            top: t.top,
          }}
        >
          {t.label}
        </div>
      ))}
      {g.xLab.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: 13,
            color: 'var(--color-neutral-700)',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            left: p.left,
            top: p.top,
          }}
        >
          {p.label}
        </div>
      ))}

      {showTooltip && hp && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            padding: '7px 11px',
            borderRadius: 6,
            background: 'var(--color-neutral-900)',
            color: '#fff',
            fontSize: 13,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            transform: 'translate(-50%,-125%)',
            left: (hp.x / width) * 100 + '%',
            top: (hp.y / height) * 100 + '%',
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.75 }}>
            {hp.label}
          </div>
          <div>{usd(Math.round(hp.value))}</div>
        </div>
      )}
    </div>
  );
}
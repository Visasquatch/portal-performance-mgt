import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { periodData } from '../api/mock-data';
import type { RemittanceMetrics } from '../api/types';
import { LineChart } from '../components/LineChart';
import { SkeletonBar } from '../components/Skeleton';
import type { ShellContext } from '../layout/AppShell';

export default function Remittance() {
  const { period } = useOutletContext<ShellContext>();
  const [data, setData] = useState<RemittanceMetrics | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    api.getRemittance(period).then((d) => {
      if (!alive) return;
      setData(d);
    });
    return () => {
      alive = false;
    };
  }, [period]);

  const D = data;
  const P = periodData[period];
  const gran = P.gran + ' granularity';
  const axisX =
    P.gran === 'Hourly' ? 'Hour of day' : P.gran === 'Monthly' ? 'Month' : 'Day';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="grid-2">
        <div className="panel" style={{ padding: 22 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
            }}
          >
            Total transactions · {P.label}
          </div>
          {D ? (
            <div className="stat-number" style={{ fontSize: 38, lineHeight: 1.15, marginTop: 6 }}>
              {D.tx}
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <SkeletonBar width={120} height={38} />
            </div>
          )}
          {D ? (
            <div style={{ fontSize: 14, marginTop: 6, color: D.txFg }}>{D.txDelta}</div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <SkeletonBar width={96} height={14} />
            </div>
          )}
        </div>
        <div className="panel" style={{ padding: 22 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
            }}
          >
            Revenue · {P.label}
          </div>
          {D ? (
            <div className="stat-number" style={{ fontSize: 38, lineHeight: 1.15, marginTop: 6 }}>
              {D.rev}
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <SkeletonBar width={120} height={38} />
            </div>
          )}
          {D ? (
            <div style={{ fontSize: 14, marginTop: 6, color: D.revFg }}>
              {D.revDelta} · avg {D.avg} per transaction
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <SkeletonBar width={190} height={14} />
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ padding: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <h5 style={{ margin: 0 }}>Revenue</h5>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {gran}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              alignSelf: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-neutral-800)',
            }}
          >
            Revenue (USD)
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {D ? (
              <LineChart
                values={D.revValues}
                labels={D.revLabels}
                width={720}
                height={190}
                padL={76}
                gradientId="bpFill3"
                showAxisL={false}
              />
            ) : (
              <SkeletonBar width="100%" height={190} />
            )}
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-neutral-800)',
                marginTop: 24,
              }}
            >
              {axisX}
            </div>
          </div>
        </div>

        <h5 style={{ margin: '22px 0 10px' }}>Transactions</h5>
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              alignSelf: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-neutral-800)',
            }}
          >
            Transactions
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative' }}>
              <svg viewBox="0 0 720 150" style={{ width: '100%', height: 'auto', display: 'block' }} fill="none">
                {D ? (
                  D.bars.map((b, i) => (
                    <rect
                      key={i}
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.h}
                      rx={2}
                      fill="var(--color-accent-400)"
                    />
                  ))
                ) : (
                  <rect x={72} y={14} width={(720 - 84) * 0.6} height={112} rx={2} fill="var(--color-accent-100)" />
                )}
                <line x1={72} y1={126} x2={708} y2={126} stroke="var(--color-neutral-400)" strokeWidth={1} />
              </svg>
              {D &&
                D.barLabels.map((label, i) => {
                  const bw = (720 - 84) / D.barLabels.length;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        fontSize: 13,
                        color: 'var(--color-neutral-700)',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        left: ((72 + i * bw + bw / 2) / 720) * 100 + '%',
                        top: (134 / 150) * 100 + '%',
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-neutral-800)',
                marginTop: 24,
              }}
            >
              {axisX}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
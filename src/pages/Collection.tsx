import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { periodData } from '../api/mock-data';
import type { CollectionMetrics } from '../api/types';
import { LineChart } from '../components/LineChart';
import { SkeletonBar } from '../components/Skeleton';
import type { ShellContext } from '../layout/AppShell';

export default function Collection() {
  const { period } = useOutletContext<ShellContext>();
  const [data, setData] = useState<CollectionMetrics | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    api.getCollection(period).then((d) => {
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
      <div
        className="panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="kicker-wide">Stream revenue · {P.label}</div>
          {D ? (
            <div className="stat-number" style={{ fontSize: 36, lineHeight: 1.15 }}>
              {D.total}
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <SkeletonBar width={148} height={40} />
            </div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 32, textAlign: 'right' }}>
          <div>
            <div className="kicker" style={{ letterSpacing: '.08em' }}>
              Transactions
            </div>
            {D ? (
              <div className="stat-number" style={{ fontSize: 26 }}>
                {D.count}
              </div>
            ) : (
              <div style={{ marginTop: 5 }}>
                <SkeletonBar width={86} height={26} />
              </div>
            )}
          </div>
          <div>
            <div className="kicker" style={{ letterSpacing: '.08em' }}>
              Processed volume
            </div>
            {D ? (
              <div className="stat-number" style={{ fontSize: 26 }}>
                {D.volume}
              </div>
            ) : (
              <div style={{ marginTop: 5 }}>
                <SkeletonBar width={86} height={26} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-4">
        {D
          ? D.cards.map((m) => (
              <div className="panel" key={m.name} style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 12,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-neutral-700)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.name}
                  </span>
                  <span className="tag tag-neutral" style={{ borderRadius: 4, whiteSpace: 'nowrap' }}>
                    {m.count} txns
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: 13, marginTop: 12 }}>
                  {m.totalLabel}
                </div>
                <div className="stat-number" style={{ fontSize: 24 }}>
                  {m.total}
                </div>
                <div className="text-muted" style={{ fontSize: 13, marginTop: 10 }}>
                  Revenue
                </div>
                <div className="stat-number" style={{ fontSize: 24, color: 'var(--color-accent-800)' }}>
                  {m.revenue}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px 12px',
                    fontSize: 14,
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid var(--color-neutral-200)',
                  }}
                >
                  <span style={{ color: m.deltaFg }}>{m.delta} value</span>
                  <span style={{ color: m.countFg }}>{m.countDelta} count</span>
                </div>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div className="panel" key={i} style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SkeletonBar width={72} height={14} />
                  <SkeletonBar width={54} height={24} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <SkeletonBar width={84} height={14} />
                </div>
                <div style={{ marginTop: 6 }}>
                  <SkeletonBar width={112} height={24} />
                </div>
                <div style={{ marginTop: 13 }}>
                  <SkeletonBar width={58} height={14} />
                </div>
                <div style={{ marginTop: 6 }}>
                  <SkeletonBar width={112} height={24} />
                </div>
                <div style={{ marginTop: 13 }}>
                  <SkeletonBar width={158} height={14} />
                </div>
              </div>
            ))}
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
          <h5 style={{ margin: 0 }}>Collection revenue over time</h5>
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
              letterSpacing: '.04em',
            }}
          >
            Revenue (USD)
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {D ? (
              <LineChart
                values={D.trendValues}
                labels={D.trendLabels}
                width={720}
                height={220}
                padL={76}
                gradientId="bpFill2"
              />
            ) : (
              <SkeletonBar width="100%" height={220} />
            )}
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-neutral-800)',
                letterSpacing: '.04em',
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
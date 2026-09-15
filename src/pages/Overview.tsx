import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { periodData } from '../api/mock-data';
import type { OverviewMetrics } from '../api/types';
import { LineChart } from '../components/LineChart';
import { DeltaChip } from '../components/Delta';
import { SkeletonBar } from '../components/Skeleton';
import { compactN, num, usd } from '../lib/format';
import type { ShellContext } from '../layout/AppShell';

interface Skins {
  bg: string;
  fg: string;
  chipBg: string;
  anim: string;
}

function skins(loading: boolean): Skins {
  return loading
    ? {
        bg: 'var(--color-neutral-300)',
        fg: 'transparent',
        chipBg: 'var(--color-neutral-300)',
        anim: 'bpPulse 1.1s ease-in-out infinite',
      }
    : {
        bg: 'transparent',
        fg: 'inherit',
        chipBg: 'var(--color-neutral-100)',
        anim: 'none',
      };
}

interface StreamCardProps {
  name: string;
  value: string;
  count: string;
  countDelta: string;
  countFg: string;
  delta: string;
  deltaFg: string;
  sk: Skins;
  skeletonValue?: boolean;
}

function StreamCard({
  name,
  value,
  count,
  countDelta,
  countFg,
  delta,
  deltaFg,
  sk,
  skeletonValue = true,
}: StreamCardProps) {
  return (
    <div className="panel" style={{ padding: 18 }}>
      <span
        style={{
          display: 'block',
          fontSize: 12,
          letterSpacing: '.09em',
          textTransform: 'uppercase',
          color: 'var(--color-neutral-700)',
        }}
      >
        {name}
      </span>
      <div
        className="stat-number"
        style={{
          fontSize: 32,
          marginTop: 8,
          background: sk.bg,
          color: sk.fg,
          animation: sk.anim,
        }}
      >
        {value || '\u00A0'}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          fontSize: 14,
          background: skeletonValue ? sk.bg : 'transparent',
          color: sk.fg,
          animation: skeletonValue ? sk.anim : 'none',
        }}
      >
        <span className="text-muted">{count}</span>
        <span style={{ color: countFg }}>{countDelta}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: deltaFg }}>{delta}</div>
    </div>
  );
}

const COMP_FILLS = [
  'var(--color-accent-700)',
  'var(--color-accent-400)',
  'var(--color-accent-200)',
];

export default function Overview() {
  const { period } = useOutletContext<ShellContext>();
  const [data, setData] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setData(null);
    api.getOverview(period).then((d) => {
      if (!alive) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [period]);

  const sk = skins(loading);
  const D = data;
  const P = periodData[period];

  const granularity = P.gran + ' granularity';
  const axisX =
    P.gran === 'Hourly' ? 'Hour of day' : P.gran === 'Monthly' ? 'Month' : 'Day';

  const heroes = D
    ? {
        total: usd(Math.round(D.total)),
        prev: usd(Math.round(D.prevTotal)),
        count: num(D.totalCount),
      }
    : { total: '', prev: '', count: '' };

  const cards = D
    ? [
        {
          name: 'Collection Platform',
          value: usd(Math.round(D.collection.value)),
          count: compactN(D.collection.count) + ' transactions',
          countDelta: deltaText(D.collection.countDeltaPct),
          countFg: chipColor(D.collection.countDeltaPct),
          delta: deltaText(D.collection.deltaPct),
          deltaFg: chipColor(D.collection.deltaPct),
        },
        {
          name: 'Remittance',
          value: usd(Math.round(D.remittance.value)),
          count: compactN(D.remittance.count) + ' transactions',
          countDelta: deltaText(D.remittance.countDeltaPct),
          countFg: chipColor(D.remittance.countDeltaPct),
          delta: deltaText(D.remittance.deltaPct),
          deltaFg: chipColor(D.remittance.deltaPct),
        },
        {
          name: 'Trade Desk (OTC)',
          value: usd(Math.round(D.trade.value)),
          count: D.trade.count + ' trades',
          countDelta: deltaText(D.trade.countDeltaPct),
          countFg: chipColor(D.trade.countDeltaPct),
          delta: deltaText(D.trade.deltaPct),
          deltaFg: chipColor(D.trade.deltaPct),
        },
      ]
    : [null, null, null];

  const comp = D
    ? D.composition.map((c, i) => {
        const w = D.total ? (c.value / D.total) * 320 : 0;
        return {
          name: c.name,
          fill: COMP_FILLS[i],
          x: ((D.total ? (D.composition.slice(0, i).reduce((s, x) => s + x.value, 0) / D.total) * 320 : 0)).toFixed(1),
          w: w.toFixed(1),
          pct: D.total ? ((c.value / D.total) * 100).toFixed(1) + '%' : '0%',
          money: usd(Math.round(c.value)),
        };
      })
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* hero */}
      <div
        className="panel"
        style={{
          padding: 26,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="kicker-wide">Total global revenue · {P.label}</div>
          <div
            className="stat-number"
            style={{
              fontSize: 54,
              marginTop: 6,
              background: sk.bg,
              color: sk.fg,
              animation: sk.anim,
            }}
          >
            {D ? heroes.total : '\u00A0'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              fontSize: 14,
            }}
          >
            {D ? <DeltaChip v={D.prevPct} /> : <SkeletonBar width={64} height={26} />}
            <span className="text-muted">
              vs previous {P.word} · {D ? heroes.prev : ''}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 34 }}>
          <div>
            <div
              className="text-muted"
              style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}
            >
              Transactions
            </div>
            <div
              className="stat-number"
              style={{
                fontSize: 28,
                background: sk.bg,
                color: sk.fg,
                animation: sk.anim,
                marginTop: 4,
              }}
            >
              {D ? heroes.count : '\u00A0'}
            </div>
            <div style={{ marginTop: 4 }}>
              {D ? <DeltaChip small v={D.prevCountPct} /> : <SkeletonBar width={60} height={22} />}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              vs previous {P.word}
            </div>
          </div>
          {D && (
            <div>
              <div
                className="text-muted"
                style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}
              >
                Last sync
              </div>
              <div className="stat-number" style={{ fontSize: 24 }}>
                {D.lastSync}
              </div>
             </div>
          )}
        </div>
      </div>
      {/* stream cards */}
      <div className="grid-3">
        {cards.map((c, i) =>
          c ? (
            <StreamCard
              key={c.name}
              name={c.name}
              value={c.value}
              count={c.count}
              countDelta={c.countDelta}
              countFg={c.countFg}
              delta={c.delta}
              deltaFg={c.deltaFg}
              sk={sk}
              skeletonValue={i !== 2}
            />
          ) : (
            <div className="panel" key={i} style={{ padding: 18 }}>
              <SkeletonBar width={120} height={16} />
              <div style={{ marginTop: 16 }}>
                <SkeletonBar width={110} height={32} />
              </div>
              <div style={{ marginTop: 14 }}>
                <SkeletonBar width={150} height={14} />
              </div>
              <div style={{ marginTop: 10 }}>
                <SkeletonBar width={96} height={14} />
              </div>
            </div>
          ),
        )}
      </div>

      {/* trend + composition */}
      <div className="grid-split">
        <div className="panel" style={{ padding: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <h5 style={{ margin: 0 }}>Global revenue over time</h5>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {granularity}
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
                  height={240}
                  padL={86}
                  gradientId="bpFill"
                />
              ) : (
                <SkeletonBar width="100%" height={240} />
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

        <div className="panel" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
          <h5 style={{ margin: '0 0 14px' }}>Composition</h5>
          <svg viewBox="0 0 320 34" width="100%" height={34} preserveAspectRatio="none">
            {comp.map((c, i) => (
              <rect
                key={i}
                x={c.x}
                y={0}
                width={c.w}
                height={34}
                fill={c.fill}
              />
            ))}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {comp.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <span style={{ width: 10, height: 10, flex: 'none', borderRadius: 2, background: c.fill }} />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.name}
                </span>
                <span className="text-muted" style={{ flex: 'none', whiteSpace: 'nowrap' }}>
                  {c.pct}
                </span>
                <span style={{ flex: 'none', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {c.money}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function deltaText(v: number): string {
  return (v >= 0 ? '▲' : '▼') + ' ' + Math.abs(v).toFixed(1) + '%';
}

function chipColor(v: number): string {
  return v >= 0 ? '#1e7a52' : '#c0392b';
}
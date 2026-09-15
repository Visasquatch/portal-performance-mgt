import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { periodData } from '../api/mock-data';
import type { Trade, TradeCalc, TradeDeskMetrics, TradeForm } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { CurrencySelect } from '../components/CurrencySelect';
import { CurrencyFlag } from '../components/icons';
import { SkeletonBar } from '../components/Skeleton';
import { num, usd } from '../lib/format';
import type { ShellContext } from '../layout/AppShell';

const CURRENCIES = ['USD', 'NGN', 'GHS', 'KES', 'ZAR', 'XAF', 'EGP', 'USDT'];

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function blankForm(): TradeForm {
  return {
    date: isoToday(),
    ccyBuy: 'USD',
    ccySell: 'NGN',
    amount: '',
    buyRate: '',
    sellRate: '',
    notes: '',
  };
}

function parse(form: TradeForm): TradeCalc {
  const amount = parseFloat(String(form.amount).replace(/,/g, ''));
  const br = parseFloat(form.buyRate);
  const sr = parseFloat(form.sellRate);
  const ok = amount > 0 && br > 0 && sr > 0;
  const spread = ok ? sr - br : 0;
  const revenue = ok ? (amount * spread) / sr : 0;
  const margin = ok ? (spread / sr) * 100 : 0;
  return {
    ok,
    amount,
    br,
    sr,
    spread,
    revenue,
    margin,
    warning: ok && spread <= 0 ? 'Sell rate is at or below the buy rate — this trade books a loss.' : '',
  };
}

function rate4(n: number): string {
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function dateLabel(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function Pair({ buy, sell, size = 17 }: { buy: string; sell: string; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <CurrencyFlag code={buy} size={size} />
      <span>{buy}</span>
      <span style={{ color: 'var(--color-neutral-500)' }}>→</span>
      <CurrencyFlag code={sell} size={size} />
      <span>{sell}</span>
    </span>
  );
}

function revenueOf(t: Trade): number {
  return (Number(t.amount) * (Number(t.sellRate) - Number(t.buyRate))) / Number(t.sellRate || 1);
}

export default function TradeDesk() {
  const { period } = useOutletContext<ShellContext>();
  const { user } = useAuth();
  const [data, setData] = useState<TradeDeskMetrics | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<TradeForm>(blankForm);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'date' | 'revenue'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api.getTradeDesk(period).then(setData), [period]);

  useEffect(() => {
    let alive = true;
    setData(null);
    api.getTradeDesk(period).then((d) => {
      if (!alive) return;
      setData(d);
    });
    return () => {
      alive = false;
    };
  }, [period]);

  const P = periodData[period];
  const isAdmin = user?.role === 'admin';

  const rows = useMemo(() => {
    if (!data) return [];
    const dir = sortDir === 'asc' ? 1 : -1;
    return data.trades
      .slice()
      .sort((a, b) => {
        if (sortKey === 'revenue') return (revenueOf(a) - revenueOf(b)) * dir;
        return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * dir;
      })
      .map((t) => ({
        id: t.id,
        date: t.date,
        dateLabel: dateLabel(t.date),
        buy: t.ccyBuy,
        sell: t.ccySell,
        amount: num(t.amount),
        buyRate: rate4(t.buyRate),
        sellRate: rate4(t.sellRate),
        spread: rate4(Number(t.sellRate) - Number(t.buyRate)),
        revenue: usd(Math.round(revenueOf(t))),
      }));
  }, [data, sortKey, sortDir]);

  const detail = useMemo(() => {
    const t = data?.trades.find((x) => x.id === detailId);
    if (!t) return null;
    const revenue = revenueOf(t);
    const dateLong = new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return {
      id: t.id,
      trade: t,
      dateLong,
      revenue: usd(Math.round(revenue)),
      spread: rate4(Number(t.sellRate) - Number(t.buyRate)),
      margin: (((Number(t.sellRate) - Number(t.buyRate)) / Number(t.sellRate || 1)) * 100).toFixed(2) + '%',
      notes: t.notes || 'No notes recorded.',
      fields: [
        { k: 'Trade ID', v: t.id },
        { k: 'Date', v: t.date },
        {
          k: 'Currency buy',
          v: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CurrencyFlag code={t.ccyBuy} />
              {t.ccyBuy}
            </span>
          ),
        },
        {
          k: 'Currency sell',
          v: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CurrencyFlag code={t.ccySell} />
              {t.ccySell}
            </span>
          ),
        },
        { k: 'Amount', v: `${num(t.amount)} ${t.ccyBuy}` },
        { k: 'Buy rate', v: rate4(t.buyRate) },
        { k: 'Sell rate', v: rate4(t.sellRate) },
        { k: 'Proceeds', v: `${num(Math.round(t.amount * t.sellRate))} ${t.ccySell}` },
        { k: 'Entered by', v: user?.email ?? '—' },
      ],
    };
  }, [data, detailId, user]);

  const calc = parse(form);
  const invalid = !calc.ok || calc.spread <= 0;

  const toggleSort = (key: 'date' | 'revenue') => {
    setSortKey((k) => {
      if (k === key) {
        setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        return k;
      }
      setSortDir('desc');
      return key;
    });
  };

  const sortMark = (key: 'date' | 'revenue') =>
    sortKey === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  const setFormField = (k: keyof TradeForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    if (invalid || saving) return;
    setSaving(true);
    try {
      await api.saveTrade({
        date: form.date,
        ccyBuy: form.ccyBuy,
        ccySell: form.ccySell,
        amount: calc.amount,
        buyRate: calc.br,
        sellRate: calc.sr,
        notes: form.notes,
      });
      setModal(false);
      setForm(blankForm());
      await load();
    } finally {
      setSaving(false);
    }
  };

  const hasTrades = !!data && data.count > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isAdmin && (
        <div className="grid-3">
          <div className="panel" style={{ padding: 22 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                color: 'var(--color-neutral-700)',
              }}
            >
              Trade Desk revenue · {P.label}
            </div>
            {data ? (
              <div className="stat-number" style={{ fontSize: 38, lineHeight: 1.15, marginTop: 6 }}>
                {data.revenue}
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <SkeletonBar width={120} height={38} />
              </div>
            )}
            {data ? (
              <div style={{ fontSize: 14, marginTop: 6, color: data.deltaFg }}>{data.delta}</div>
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
              Trade volume
            </div>
            {data ? (
              <div className="stat-number" style={{ fontSize: 38, lineHeight: 1.15, marginTop: 6 }}>
                {data.volume}
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <SkeletonBar width={100} height={38} />
              </div>
            )}
            {data && (
              <div className="text-muted" style={{ fontSize: 14, marginTop: 6 }}>
                Notional bought, USD equivalent
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
              Trades logged
            </div>
            {data ? (
              <div className="stat-number" style={{ fontSize: 38, lineHeight: 1.15, marginTop: 6 }}>
                {data.count}
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <SkeletonBar width={56} height={38} />
              </div>
            )}
            {data && (
              <div className="text-muted" style={{ fontSize: 14, marginTop: 6 }}>
                Avg spread {data.avgSpread}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="panel" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
          <h5 style={{ margin: 0 }}>OTC transaction log</h5>
          {data && (
            <span className="text-muted" style={{ fontSize: 13 }}>
              {data.count} trades in {P.label}
            </span>
          )}
          {!isAdmin && (
              <button
                className="btn btn-primary"
                style={{ marginLeft: 'auto', height: 38 }}
                onClick={() => setModal(true)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Log new trade
              </button>
            )}
        </div>

        {!data ? (
          <div style={{ padding: 12 }}>
            <SkeletonBar width={120} height={16} />
            <div style={{ marginTop: 10 }}>
              <SkeletonBar width="100%" height={200} />
            </div>
          </div>
        ) : hasTrades ? (
          <table className="table" style={{ fontSize: 14 }}>
            <thead>
              <tr>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('date')}
                >
                  Date{sortMark('date')}
                </th>
                <th>Pair</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Buy rate</th>
                <th style={{ textAlign: 'right' }}>Sell rate</th>
                <th style={{ textAlign: 'right' }}>Spread</th>
                <th
                  style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('revenue')}
                >
                  Revenue{sortMark('revenue')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setDetailId(r.id)}>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.dateLabel}</td>
                  <td>
                    <Pair buy={r.buy} sell={r.sell} />
                  </td>
                  <td style={{ textAlign: 'right' }}>{r.amount}</td>
                  <td style={{ textAlign: 'right' }}>{r.buyRate}</td>
                  <td style={{ textAlign: 'right' }}>{r.sellRate}</td>
                  <td style={{ textAlign: 'right' }}>{r.spread}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-accent-800)' }}>
                    {r.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              padding: '56px 20px',
              textAlign: 'center',
              border: '1px dashed var(--color-neutral-300)',
              borderRadius: 8,
              background: 'var(--color-neutral-100)',
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              style={{ margin: '0 auto 12px' }}
            >
              <polyline points="3 17 9 11 13 15 21 7" />
              <polyline points="15 7 21 7 21 13" />
            </svg>
            <h5 style={{ margin: '0 0 4px' }}>No trades in this period</h5>
            {!isAdmin && (
              <button className="btn btn-primary" onClick={() => setModal(true)}>
                Log new trade
              </button>
            )}
          </div>
        )}
      </div>

      {!isAdmin && modal && (
        <div className="dialog-backdrop" onClick={() => setModal(false)}>
          <div
            className="dialog"
            style={{ width: 'min(640px,100%)', borderRadius: 10, padding: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="dialog-title" style={{ flex: 1 }}>
                Log new OTC trade
              </div>
              <button
                style={{
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  border: 0,
                  borderRadius: 6,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setModal(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}
            >
              <div className="field">
                <label>Date</label>
                <input
                  className="input"
                  style={{ background: '#fff' }}
                  type="date"
                  value={form.date}
                  onChange={(e) => setFormField('date', e.target.value)}
                />
              </div>
              <CurrencySelect
                label="Currency buy"
                value={form.ccyBuy}
                options={CURRENCIES}
                onChange={(c) => setFormField('ccyBuy', c)}
              />
              <CurrencySelect
                label="Currency sell"
                value={form.ccySell}
                options={CURRENCIES}
                onChange={(c) => setFormField('ccySell', c)}
              />
              <div className="field">
                <label>Amount ({form.ccyBuy})</label>
                <input
                  className="input"
                  style={{ background: '#fff' }}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setFormField('amount', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Buy rate</label>
                <input
                  className="input"
                  style={{ background: '#fff' }}
                  inputMode="decimal"
                  placeholder="0.0000"
                  value={form.buyRate}
                  onChange={(e) => setFormField('buyRate', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Sell rate</label>
                <input
                  className="input"
                  style={{ background: '#fff' }}
                  inputMode="decimal"
                  placeholder="0.0000"
                  value={form.sellRate}
                  onChange={(e) => setFormField('sellRate', e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <input
                className="input"
                style={{ background: '#fff' }}
                placeholder="Counterparty, settlement route…"
                value={form.notes}
                onChange={(e) => setFormField('notes', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 16, padding: '14px 16px', borderRadius: 8, background: 'var(--color-accent-100)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
                  Spread
                </div>
                <div className="stat-number" style={{ fontSize: 24 }}>
                  {calc.ok ? calc.spread.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '—'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
                  Revenue (USD)
                </div>
                <div className="stat-number" style={{ fontSize: 24 }}>
                  {calc.ok && calc.spread > 0 ? usd(Math.round(calc.revenue)) : '—'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
                  Margin
                </div>
                <div className="stat-number" style={{ fontSize: 24 }}>
                  {calc.ok && calc.spread > 0 ? calc.margin.toFixed(2) + '%' : '—'}
                </div>
              </div>
            </div>
            {calc.warning && (
              <p style={{ fontSize: 13, color: '#c0392b', margin: 0 }}>{calc.warning}</p>
            )}
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={invalid || saving} onClick={onSave}>
                {saving ? 'Saving…' : 'Save trade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(20,24,28,.42)',
          }}
          onClick={() => setDetailId(null)}
        >
          <div
            style={{
              width: 'min(440px,100%)',
              height: '100%',
              background: '#fff',
              boxShadow: 'var(--shadow-lg)',
              padding: 24,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>
                  Trade {detail.id}
                </div>
                <h4 style={{ margin: '4px 0 0' }}>
                  <Pair buy={detail.trade.ccyBuy} sell={detail.trade.ccySell} size={22} />
                </h4>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {detail.dateLong}
                </div>
              </div>
              <button
                style={{
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  border: 0,
                  borderRadius: 6,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setDetailId(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: 16, borderRadius: 8, background: 'var(--color-accent-100)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
                Revenue
              </div>
              <div className="stat-number" style={{ fontSize: 34, lineHeight: 1.15 }}>
                {detail.revenue}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-accent-800)' }}>
                Spread {detail.spread} · margin {detail.margin}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontSize: 14 }}>
              {detail.fields.map((f) => (
                <div
                  key={f.k}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '9px 0',
                    borderBottom: '1px solid var(--color-neutral-200)',
                  }}
                >
                  <span className="text-muted" style={{ flex: 1 }}>
                    {f.k}
                  </span>
                  <span>{f.v}</span>
                </div>
              ))}
            </div>
            <div>
              <div
                className="text-muted"
                style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}
              >
                Notes
              </div>
              <p style={{ fontSize: 14, margin: 0 }}>{detail.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
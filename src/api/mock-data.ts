import type { ColCard, Member, PeriodData, PeriodKey, Trade } from './types';
import { compact, compactN, deltaChip, deltaText, usd } from '../lib/format';
import { distribute } from '../lib/charts';

export const periodData: Record<PeriodKey, PeriodData> = {
  today: {
    label: 'Today',
    word: 'day',
    gran: 'Hourly',
    prevPct: 8.4,
    col: { payinT: 1684000, payinR: 11788, payinN: 4120, payoutT: 1052000, payoutR: 5260, payoutN: 1860, setT: 1398000, setR: 2796, setN: 96, fxT: 206000, fxR: 4910, fxN: 240 },
    rem: { tx: 742, rev: 6180, txD: 4.1, revD: 6.2 },
    labels: ['00', '03', '06', '09', '12', '15', '18', '21'],
    weights: [2, 3, 5, 12, 16, 18, 14, 9],
  },
  d7: {
    label: '7D',
    word: '7 days',
    gran: 'Daily',
    prevPct: 12.1,
    col: { payinT: 11420000, payinR: 79940, payinN: 28400, payoutT: 7280000, payoutR: 36400, payoutN: 12900, setT: 9650000, setR: 19300, setN: 640, fxT: 1368000, fxR: 32600, fxN: 1610 },
    rem: { tx: 5120, rev: 41300, txD: 7.8, revD: 9.4 },
    labels: ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'],
    weights: [14, 16, 9, 7, 17, 18, 16],
  },
  mtd: {
    label: 'MTD',
    word: 'month',
    gran: 'Daily',
    prevPct: 5.6,
    col: { payinT: 48900000, payinR: 342300, payinN: 121600, payoutT: 31200000, payoutR: 156000, payoutN: 55200, setT: 41500000, setR: 83000, setN: 2740, fxT: 5850000, fxR: 139400, fxN: 6880 },
    rem: { tx: 21480, rev: 172900, txD: 3.2, revD: 5.1 },
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    weights: [9, 11, 12, 7, 6, 13, 14, 12, 10, 11],
  },
  ytd: {
    label: 'YTD',
    word: 'year',
    gran: 'Monthly',
    prevPct: 23.4,
    col: { payinT: 412800000, payinR: 2890000, payinN: 1042000, payoutT: 268400000, payoutR: 1342000, payoutN: 468000, setT: 355000000, setR: 710000, setN: 23400, fxT: 49700000, fxR: 1184000, fxN: 58900 },
    rem: { tx: 184320, rev: 1472000, txD: 18.6, revD: 23.9 },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    weights: [7, 8, 9, 10, 11, 12, 13, 14, 9],
  },
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const seedMembers = [
  { email: 'ops@banffpay.ca', role: 'Admin' as const, status: 'Active' as const },
  { email: 'cfo@banffpay.ca', role: 'Admin' as const, status: 'Active' as const },
  { email: 'treasury@banffpay.ca', role: 'Treasury' as const, status: 'Pending' as const },
];

export function tradeRevenue(t: Trade): number {
  return (Number(t.amount) * (Number(t.sellRate) - Number(t.buyRate))) / Number(t.sellRate || 1);
}

export function isoToday(): string {
  return iso(new Date());
}

let trades: Trade[] = [];
let members: Member[] = [...seedMembers];
let lastSyncLabel = '2 min ago';

export function periodStart(key: PeriodKey): Date {
  const now = new Date();
  const d = new Date(now);
  if (key === 'today') {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (key === 'd7') {
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (key === 'mtd') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

export function listTrades(): Trade[] {
  return trades;
}

export function addTrade(t: Trade): void {
  trades = [t, ...trades];
  lastSyncLabel = 'Just now';
}

export function tradesInPeriod(key: PeriodKey): Trade[] {
  const s = iso(periodStart(key));
  return trades.filter((t) => t.date >= s);
}

export function tradeDeskSummary(key: PeriodKey): {
  revenue: number;
  volume: number;
  count: number;
  avgSpread: number;
} {
  const list = tradesInPeriod(key);
  const revenue = list.reduce((s, t) => s + tradeRevenue(t), 0);
  const volume = list.reduce((s, t) => s + Number(t.amount), 0);
  const avgSpread = list.length
    ? list.reduce((s, t) => s + ((Number(t.sellRate) - Number(t.buyRate)) / Number(t.sellRate || 1)) * 100, 0) /
      list.length
    : 0;
  return { revenue, volume, count: list.length, avgSpread };
}

export function listMembers(): Member[] {
  return members;
}

export function addMember(m: Member): void {
  members = [...members, m];
}

export function toggleMemberRole(index: number): Member[] {
  members = members.map((x, j) =>
    j === index
      ? { ...x, role: x.role === 'Admin' ? 'Treasury' : 'Admin' }
      : x,
  );
  return members;
}

export function lastSync(): string {
  return lastSyncLabel;
}

export function streamTotals(key: PeriodKey): {
  collection: number;
  remittance: number;
  trade: number;
  total: number;
} {
  const D = periodData[key];
  const collection = D.col.payinR + D.col.payoutR + D.col.setR + D.col.fxR;
  const remittance = D.rem.rev;
  const trade = tradesInPeriod(key).reduce((s, t) => s + tradeRevenue(t), 0);
  return { collection, remittance, trade, total: collection + remittance + trade };
}

export function collectionCount(key: PeriodKey): number {
  const c = periodData[key].col;
  return c.payinN + c.payoutN + c.setN + c.fxN;
}

export function collectionTotal(key: PeriodKey): number {
  const c = periodData[key].col;
  return c.payinR + c.payoutR + c.setR + c.fxR;
}

export function collectionCards(key: PeriodKey): ColCard[] {
  const P = periodData[key];
  const c = P.col;
  const defs: {
    name: string;
    totalLabel: string;
    total: number;
    revenue: number;
    count: number;
    d: number;
    cd: number;
  }[] = [
    { name: 'Pay In', totalLabel: 'Total volume', total: c.payinT, revenue: c.payinR, count: c.payinN, d: P.prevPct - 1.4, cd: P.prevPct - 6.1 },
    { name: 'Pay Out', totalLabel: 'Total volume', total: c.payoutT, revenue: c.payoutR, count: c.payoutN, d: P.prevPct + 1.9, cd: P.prevPct - 2.7 },
    { name: 'Settlement', totalLabel: 'Total settled', total: c.setT, revenue: c.setR, count: c.setN, d: P.prevPct - 4.8, cd: P.prevPct - 8.9 },
    { name: 'FX Gains', totalLabel: 'Settled in USDT / FX', total: c.fxT, revenue: c.fxR, count: c.fxN, d: P.prevPct + 7.2, cd: P.prevPct + 3.4 },
  ];
  return defs.map((m) => {
    const dt = deltaText(m.d);
    const cc = deltaChip(m.cd);
    return {
      name: m.name,
      totalLabel: m.totalLabel,
      total: compact(m.total),
      revenue: usd(m.revenue),
      count: compactN(m.count),
      delta: dt.text,
      deltaFg: dt.fg,
      countDelta: cc.arrow + ' ' + cc.pct,
      countFg: cc.fg,
    };
  });
}

export function collectionTrend(key: PeriodKey): { values: number[]; labels: string[] } {
  const P = periodData[key];
  return { values: distribute(collectionTotal(key), P.weights), labels: P.labels };
}

export function remittanceRevTrend(key: PeriodKey): { values: number[]; labels: string[] } {
  const P = periodData[key];
  return { values: distribute(P.rem.rev, P.weights), labels: P.labels };
}

export function remittanceBars(key: PeriodKey): {
  bars: { x: number; y: number; w: number; h: number }[];
  labels: string[];
} {
  const D = periodData[key];
  const vals = distribute(D.rem.tx, D.weights.map((w, i) => w + (i % 2 ? 1 : 0)));
  const max = Math.max(...vals) * 1.15 || 1;
  const bw = (720 - 84) / vals.length;
  const bars = vals.map((v, i) => {
    const h = (v / max) * 104;
    return {
      x: +(72 + i * bw + bw * 0.2).toFixed(1),
      y: +(126 - h).toFixed(1),
      w: +(bw * 0.6).toFixed(1),
      h: +h.toFixed(1),
    };
  });
  return { bars, labels: D.labels };
}
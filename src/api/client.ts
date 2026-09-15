import type {
  CollectionMetrics,
  LoginResponse,
  OverviewMetrics,
  PeriodKey,
  RemittanceMetrics,
  Role,
  SettingsData,
  Trade,
  TradeDeskMetrics,
  User,
} from './types';
import {
  addMember,
  collectionCards,
  collectionCount,
  collectionTotal,
  collectionTrend,
  lastSync,
  listMembers,
  addTrade,
  periodData,
  remittanceBars,
  remittanceRevTrend,
  streamTotals,
  toggleMemberRole,
  tradeDeskSummary,
  tradesInPeriod,
  listTrades,
} from './mock-data';
import { compact, compactN, deltaText, num, usd } from '../lib/format';
import { distribute } from '../lib/charts';

const DEFAULT_LATENCY = 620;

function run<T>(fn: () => T, ms?: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn()), ms ?? DEFAULT_LATENCY);
  });
}

const EMAIL_RE = /.+@.+\..+/;

function buildOverview(period: PeriodKey): OverviewMetrics {
  const D = periodData[period];
  const weights = D.weights;
  const tradeList = tradesInPeriod(period);
  const totals = streamTotals(period);
  const colCount = collectionCount(period);

  return {
    lastSync: lastSync(),
    total: totals.total,
    prevTotal: totals.total / (1 + D.prevPct / 100),
    prevPct: D.prevPct,
    totalCount: colCount + D.rem.tx + tradeList.length,
    prevCountPct: D.prevPct - 4.6,
    collection: {
      value: totals.collection,
      count: colCount,
      deltaPct: D.prevPct - 2.1,
      countDeltaPct: D.prevPct - 5.4,
      spark: distribute(totals.collection, weights),
    },
    remittance: {
      value: totals.remittance,
      count: D.rem.tx,
      deltaPct: D.rem.revD,
      countDeltaPct: D.rem.txD,
      spark: distribute(totals.remittance, weights.slice().reverse()),
    },
    trade: {
      value: totals.trade,
      count: tradeList.length,
      deltaPct: D.prevPct + 4.3,
      countDeltaPct: D.prevPct - 9.2,
      spark: distribute(totals.trade || 1, weights.map((w, i) => w + (i % 3) * 2)),
    },
    trendValues: distribute(totals.total, weights),
    trendLabels: D.labels,
    composition: [
      { name: 'Collection Platform', value: totals.collection },
      { name: 'Remittance', value: totals.remittance },
      { name: 'Trade Desk', value: totals.trade },
    ],
  };
}

const client = {
  async login(email: string, password: string, role: Role): Promise<LoginResponse> {
    return run(() => {
      if (!EMAIL_RE.test(email) || password.length < 6) {
        return { ok: false, error: 'Enter your invited email and a password of at least 6 characters.' };
      }
      const user: User = { email, role };
      return { ok: true, user };
    }, 400);
  },

  async acceptInvite(email: string, password: string, role: Role): Promise<LoginResponse> {
    return run(() => {
      const ok8 = password.length >= 8;
      const okNum = /\d/.test(password);
      if (!ok8 || !okNum) {
        return { ok: false, error: 'Password does not meet the requirements yet.' };
      }
      const user: User = { email, role };
      return { ok: true, user };
    }, 400);
  },

  async getOverview(period: PeriodKey): Promise<OverviewMetrics> {
    return run(() => buildOverview(period));
  },

  async getCollection(period: PeriodKey): Promise<CollectionMetrics> {
    return run(() => {
      const D = periodData[period];
      const colTotal = collectionTotal(period);
      const trend = collectionTrend(period);
      return {
        total: usd(Math.round(colTotal)),
        volume: compact(D.col.payinT + D.col.payoutT + D.col.setT),
        count: compactN(collectionCount(period)),
        cards: collectionCards(period),
        trendValues: trend.values,
        trendLabels: trend.labels,
      };
    });
  },

  async getRemittance(period: PeriodKey): Promise<RemittanceMetrics> {
    return run(() => {
      const D = periodData[period];
      const revTrend = remittanceRevTrend(period);
      const bars = remittanceBars(period);
      const txDelta = deltaText(D.rem.txD);
      const revDelta = deltaText(D.rem.revD);
      return {
        tx: num(D.rem.tx),
        rev: usd(D.rem.rev),
        avg: usd(D.rem.rev / D.rem.tx, 2),
        txDelta: txDelta.text,
        txFg: txDelta.fg,
        revDelta: revDelta.text,
        revFg: revDelta.fg,
        revValues: revTrend.values,
        revLabels: revTrend.labels,
        bars: bars.bars,
        barLabels: bars.labels,
      };
    });
  },

  async getTrades(): Promise<Trade[]> {
    return run(() => listTrades());
  },

  async getTradeDesk(period: PeriodKey): Promise<TradeDeskMetrics> {
    return run(() => {
      const D = periodData[period];
      const s = tradeDeskSummary(period);
      const delta = deltaText(D.prevPct + 4.3);
      return {
        revenue: usd(Math.round(s.revenue)),
        volume: compact(s.volume),
        count: s.count,
        avgSpread: s.avgSpread.toFixed(2) + '%',
        delta: delta.text,
        deltaFg: delta.fg,
        trades: tradesInPeriod(period),
      };
    });
  },

  async saveTrade(trade: Omit<Trade, 'id'>): Promise<Trade> {
    return run(() => {
      const id = 'OTC-' + String(1043 + listTrades().length).padStart(4, '0');
      const full: Trade = { ...trade, id };
      addTrade(full);
      return full;
    });
  },

  async getSettings(): Promise<SettingsData> {
    return run(() => ({ members: listMembers(), lastSync: lastSync() }));
  },

  async inviteMember(email: string, role: 'Admin' | 'Treasury'): Promise<void> {
    return run(() => {
      addMember({ email, role, status: 'Pending' });
    });
  },

  async toggleMember(index: number): Promise<void> {
    return run(() => {
      toggleMemberRole(index);
    });
  },
};

export const api = client;
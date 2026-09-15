export type Role = 'admin' | 'treasury';

export type PeriodKey = 'today' | 'd7' | 'mtd' | 'ytd';

export interface User {
  email: string;
  role: Role;
}

export interface Trade {
  id: string;
  date: string;
  ccyBuy: string;
  ccySell: string;
  amount: number;
  buyRate: number;
  sellRate: number;
  notes: string;
}

export interface Member {
  email: string;
  role: 'Admin' | 'Treasury';
  status: 'Active' | 'Pending';
}

export interface SettingsData {
  members: Member[];
  lastSync: string;
}

export interface LoginResult {
  ok: true;
  user: User;
}

export interface LoginFailure {
  ok: false;
  error: string;
}

export type LoginResponse = LoginResult | LoginFailure;

export interface PeriodData {
  label: string;
  word: string;
  gran: 'Hourly' | 'Daily' | 'Monthly';
  prevPct: number;
  col: {
    payinT: number;
    payinR: number;
    payinN: number;
    payoutT: number;
    payoutR: number;
    payoutN: number;
    setT: number;
    setR: number;
    setN: number;
    fxT: number;
    fxR: number;
    fxN: number;
  };
  rem: { tx: number; rev: number; txD: number; revD: number };
  labels: string[];
  weights: number[];
}

export interface StreamMetric {
  value: number;
  count: number;
  deltaPct: number;
  countDeltaPct: number;
  spark: number[];
}

export interface CompositionSlice {
  name: string;
  value: number;
}

export interface OverviewMetrics {
  lastSync: string;
  total: number;
  prevTotal: number;
  prevPct: number;
  totalCount: number;
  prevCountPct: number;
  collection: StreamMetric;
  remittance: StreamMetric;
  trade: StreamMetric;
  trendValues: number[];
  trendLabels: string[];
  composition: CompositionSlice[];
}

export interface ColCard {
  name: string;
  totalLabel: string;
  total: string;
  revenue: string;
  count: string;
  delta: string;
  deltaFg: string;
  countDelta: string;
  countFg: string;
}

export interface CollectionMetrics {
  total: string;
  volume: string;
  count: string;
  cards: ColCard[];
  trendValues: number[];
  trendLabels: string[];
}

export interface RemittanceBar {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RemittanceMetrics {
  tx: string;
  rev: string;
  avg: string;
  txDelta: string;
  txFg: string;
  revDelta: string;
  revFg: string;
  revValues: number[];
  revLabels: string[];
  bars: RemittanceBar[];
  barLabels: string[];
}

export interface TradeDeskMetrics {
  revenue: string;
  volume: string;
  count: number;
  avgSpread: string;
  delta: string;
  deltaFg: string;
  trades: Trade[];
}

export interface TradeForm {
  date: string;
  ccyBuy: string;
  ccySell: string;
  amount: string;
  buyRate: string;
  sellRate: string;
  notes: string;
}

export interface TradeCalc {
  ok: boolean;
  amount: number;
  br: number;
  sr: number;
  spread: number;
  revenue: number;
  margin: number;
  warning: string;
}
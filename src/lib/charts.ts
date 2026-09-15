import { compact } from './format';

export interface LinePoint {
  x: number;
  y: number;
  value: number;
  label: string;
  i: number;
}

export interface LineGeometry {
  path: string;
  area: string;
  pts: LinePoint[];
  yTicks: { y: number; label: string; x1: number; x2: number }[];
  padL: number;
  baseY: number;
  right: number;
  yLab: { label: string; w: string; top: string }[];
  xLab: { label: string; left: string; top: string }[];
}

export interface LineOptions {
  padL?: number;
  padB?: number;
}

export function buildLine(
  values: number[],
  labels: string[],
  w: number,
  h: number,
  opts?: LineOptions,
): LineGeometry {
  const o = opts || {};
  const padL = o.padL || 72;
  const padR = 12;
  const padT = 12;
  const padB = o.padB || 30;
  const iw = w - padL - padR;
  const ih = h - padT - padB;
  const n = values.length;
  const max = Math.max.apply(null, values) * 1.15 || 1;

  const pts: LinePoint[] = values.map((v, i) => {
    const x = padL + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
    return {
      x: +x.toFixed(1),
      y: +(padT + ih - (v / max) * ih).toFixed(1),
      value: v,
      label: labels[i],
      i,
    };
  });

  const path = pts
    .map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y)
    .join(' ');
  const baseY = padT + ih;
  const area =
    path + ' L' + pts[n - 1].x + ' ' + baseY + ' L' + pts[0].x + ' ' + baseY + ' Z';

  const yTicks = [0, 1, 2, 3].map((i) => {
    const v = (max * (3 - i)) / 3;
    const y = +(padT + (ih * i) / 3).toFixed(1);
    return { y, label: compact(v), x1: padL, x2: w - padR };
  });

  const gw = (padL / w) * 100 + '%';

  return {
    path,
    area,
    pts,
    yTicks,
    padL,
    baseY,
    right: w - padR,
    yLab: yTicks.map((t) => ({ label: t.label, w: gw, top: (t.y / h) * 100 + '%' })),
    xLab: pts.map((p) => ({
      label: p.label,
      left: (p.x / w) * 100 + '%',
      top: ((baseY + 8) / h) * 100 + '%',
    })),
  };
}

export function distribute(total: number, weights: number[]): number[] {
  const s = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (total * w) / s);
}

export function spark(values: number[]): string {
  const max = Math.max.apply(null, values) || 1;
  const min = Math.min.apply(null, values);
  const n = values.length;
  return values
    .map(
      (v, i) =>
        (i ? 'L' : 'M') +
        ((i * 108) / (n - 1)).toFixed(1) +
        ' ' +
        (28 - ((v - min) / ((max - min) || 1)) * 26).toFixed(1),
    )
    .join(' ');
}
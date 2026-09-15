import { spark } from '../lib/charts';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  values,
  width = 108,
  height = 30,
  color = 'var(--color-accent)',
}: SparklineProps) {
  const path = spark(values);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 108 30"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <path d={path} stroke={color} strokeWidth={1.75} />
    </svg>
  );
}
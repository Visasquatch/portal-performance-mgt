export function SkeletonBar({ width, height, radius = 6 }: { width: number | string; height: number; radius?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--color-neutral-300)',
        animation: 'bpPulse 1.1s ease-in-out infinite',
      }}
    />
  );
}
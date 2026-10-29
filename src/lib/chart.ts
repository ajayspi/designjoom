// ponytail: build-time SVG chart geometry. Four pure functions, no dependency —
// recharts was 437 kB of client JS to draw shapes we already know the coordinates of.

export const points = (values: number[], w: number, h: number) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / span) * h,
  }));
};

/** Monotone-ish polyline (cubic through midpoints) — smooth without a spline library. */
export const linePath = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C${cx.toFixed(1)},${prev.y.toFixed(1)} ${cx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

/** Wrap an area chart path into a closed shape that sits on the baseline. */
export const areaPath = (pts: { x: number; y: number }[], h: number) =>
  `${linePath(pts)} L${pts[pts.length - 1].x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`;

/** Radar polygon points for `<polygon points="...">` (values are 0..100, scaled to `r`). */
export const radarPath = (values: number[], cx: number, cy: number, r: number) =>
  values.map((v, i) => {
    const a = (i / values.length) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + Math.cos(a) * r * (v / 100)).toFixed(1)},${(cy + Math.sin(a) * r * (v / 100)).toFixed(1)}`;
  }).join(" ");

/** Wrap a label onto at most two lines so it fits a narrow axis slot. */
export const twoLines = (label: string) => {
  const words = label.split(" ");
  if (words.length <= 2) return [label];
  return [words.slice(0, words.length - 1).join(" "), words[words.length - 1]];
};

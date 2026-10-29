// Neural particle background. Ported from the React canvas verbatim.
// ponytail: the O(n²) connection pass is bounded to the hero canvas and stops
// entirely when it scrolls out of view — at 90 nodes that is ~4k comparisons/frame.
import { onReady } from "./dom";

onReady(() => {
const canvas = document.getElementById("neural-canvas") as HTMLCanvasElement | null;
if (canvas) {
  const ctx = canvas.getContext("2d");
  const mouse = { x: -999, y: -999 };
  let raf = 0;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  addEventListener("resize", resize, { passive: true });

  const PALETTE = [[59, 130, 246], [124, 58, 237], [6, 182, 212], [99, 102, 241], [139, 92, 246]];
  interface Node { x: number; y: number; vx: number; vy: number; r: number; pulse: number; ci: number }
  const nodes: Node[] = Array.from({ length: 90 }, (_, i) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.8 + 0.8,
    pulse: Math.random() * Math.PI * 2,
    ci: i % PALETTE.length,
  }));

  const draw = () => {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    const { x: mx, y: my } = mouse;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      n.pulse += 0.022;
      const dx = mx - n.x, dy = my - n.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300 && dist > 0) { n.vx += (dx / dist) * 0.028; n.vy += (dy / dist) * 0.028; }
      n.vx *= 0.96; n.vy *= 0.96;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= 155) continue;
        const a = (1 - d / 155) * 0.25;
        const ci = PALETTE[nodes[i].ci], cj = PALETTE[nodes[j].ci];
        const g = ctx!.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        g.addColorStop(0, `rgba(${ci[0]},${ci[1]},${ci[2]},${a})`);
        g.addColorStop(1, `rgba(${cj[0]},${cj[1]},${cj[2]},${a})`);
        ctx!.beginPath();
        ctx!.moveTo(nodes[i].x, nodes[i].y);
        ctx!.lineTo(nodes[j].x, nodes[j].y);
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();
      }
    }

    for (const n of nodes) {
      const pulse = Math.sin(n.pulse) * 0.5 + 0.5;
      const c = PALETTE[n.ci];
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, n.r * (1 + pulse * 0.4), 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.65 + pulse * 0.35})`;
      ctx!.fill();
      const g2 = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9);
      g2.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.1)`);
      g2.addColorStop(1, "transparent");
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, n.r * 9, 0, Math.PI * 2);
      ctx!.fillStyle = g2;
      ctx!.fill();
    }

    raf = requestAnimationFrame(draw);
  };

  addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });

  const vis = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) draw(); }
    else { cancelAnimationFrame(raf); raf = 0; }
  });
  vis.observe(canvas);
  draw();

  addEventListener("pagehide", () => {
    cancelAnimationFrame(raf);
    vis.disconnect();
    removeEventListener("resize", resize);
  }, { once: true });
}
});

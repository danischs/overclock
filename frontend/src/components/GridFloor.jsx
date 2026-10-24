import { useEffect, useRef } from "react";

/**
 * Synthwave floor drawn on canvas with real perspective.
 * Horizontal lines fade out as they bunch up near the horizon, so the far
 * end never aliases/shimmers the way a CSS background grid does.
 */
const CAM_DEPTH = 8;      // distance (in grid cells) from camera to bottom edge
const COL_GAP_PX = 80;    // spacing of vertical lines at the bottom edge
const SPEED = 1.2;        // grid cells per second
const RGB = "255, 31, 143";

export default function GridFloor({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      if (!h) return;
      const focal = h * CAM_DEPTH;
      const offset = reduceMotion ? 0 : ((time / 1000) * SPEED) % 1;
      ctx.lineWidth = 1;

      for (let k = 0; k < 2000; k++) {
        const z = CAM_DEPTH + k - offset;
        const y = focal / z;
        if (y < 0.5) break;
        if (y > h) continue;
        const gap = y - focal / (z + 1);
        const density = Math.min(1, Math.max(0, (gap - 2) / 8));
        const depth = Math.pow(y / h, 0.7);
        const alpha = 0.6 * density * depth;
        if (alpha < 0.01) continue;
        ctx.strokeStyle = `rgba(${RGB}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const cx = w / 2;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgba(${RGB}, 0)`);
      grad.addColorStop(0.35, `rgba(${RGB}, 0.12)`);
      grad.addColorStop(1, `rgba(${RGB}, 0.5)`);
      ctx.strokeStyle = grad;
      const reach = Math.ceil((w * 3) / COL_GAP_PX);
      ctx.beginPath();
      for (let i = -reach; i <= reach; i++) {
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + i * COL_GAP_PX, h);
      }
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

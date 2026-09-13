"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number; z: number; arrival: number };
const count = 156;
const points: Point[] = Array.from({ length: count }, (_, i) => {
  const y = 1 - (i / (count - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, arrival: (i % 17) / 17 };
});
const edges: [number, number][] = [];
points.forEach((p, i) => {
  const near = points.map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
    .filter((q) => q.j !== i).sort((a, b) => a.d - b.d).slice(0, 4);
  near.forEach(({ j }) => { if (j > i) edges.push([i, j]); });
});
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => 1 - (1 - clamp(n)) ** 3;

export default function NetworkScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches;
    let visible = true;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let width = 0;
    let height = 0;
    let redraw = true;
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw = true;
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    observer.observe(canvas);
    const changeMotion = () => { reduced = media.matches; redraw = true; };
    media.addEventListener("change", changeMotion);

    function paint(time: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      const cx = width * .59, cy = height * .48;
      const radius = Math.min(width * .345, height * .38);
      const rootX = width * .105, rootY = height * .52;
      const expansion = ease((time - .25) / 3.5);
      const rotation = time > 3 ? (time - 3) * .045 : 0;
      const cos = Math.cos(rotation), sin = Math.sin(rotation);
      const projected = points.map((p) => {
        const x = p.x * cos + p.z * sin;
        const z = -p.x * sin + p.z * cos;
        const perspective = 2.8 / (2.8 - z * .35);
        const targetX = cx + x * radius * perspective;
        const targetY = cy + p.y * radius * .94 * perspective;
        const birth = ease((time - p.arrival * 2.6 - .4) / 1.5);
        return { x: rootX + (targetX - rootX) * expansion, y: rootY + (targetY - rootY) * expansion, z, alpha: birth * (.2 + (z + 1) * .4) };
      });
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.25);
      halo.addColorStop(0, "rgba(11,100,244,0.035)"); halo.addColorStop(.7, "rgba(11,100,244,0.015)"); halo.addColorStop(1, "rgba(11,100,244,0)");
      ctx.fillStyle = halo; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = `rgba(11,100,244,${.12 * expansion})`; ctx.lineWidth = .7;
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * (1.08 + ring * .12), radius * (.72 + ring * .05), -.45 + ring * .55, 0, Math.PI * 2);
        ctx.stroke();
      }
      edges.forEach(([a, b], i) => {
        const p = projected[a], q = projected[b];
        const alpha = Math.min(p.alpha, q.alpha);
        if (alpha < .01) return;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        const bend = ((i % 3) - 1) * 7 * expansion;
        ctx.quadraticCurveTo((p.x + q.x) / 2 + bend, (p.y + q.y) / 2 - bend, q.x, q.y);
        ctx.strokeStyle = `rgba(11,100,244,${alpha * .28})`; ctx.lineWidth = .65; ctx.stroke();
      });
      [36, 71, 112].forEach((index, i) => {
        const target = projected[index];
        const progress = ease((time - .2 - i * .3) / 1.7);
        ctx.beginPath(); ctx.moveTo(rootX, rootY);
        ctx.bezierCurveTo(rootX + width * .17, rootY, target.x - width * .12, target.y, rootX + (target.x - rootX) * progress, rootY + (target.y - rootY) * progress);
        ctx.strokeStyle = `rgba(11,100,244,${.5 * expansion})`; ctx.lineWidth = 1.15; ctx.stroke();
      });
      projected.sort((a, b) => a.z - b.z).forEach((p, i) => {
        if (p.alpha < .01) return;
        const size = (i % 13 === 0 ? 3.3 : 1.4) * (.75 + (p.z + 1) * .25);
        if (i % 13 === 0) {
          ctx.beginPath(); ctx.arc(p.x, p.y, size + 5, 0, Math.PI * 2); ctx.fillStyle = `rgba(11,100,244,${p.alpha * .065})`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fillStyle = `rgba(11,100,244,${p.alpha})`; ctx.fill();
      });
    }
    function tick(now: number) {
      const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      if (visible && !document.hidden && !pausedRef.current && !reduced) { elapsed += delta; redraw = true; }
      if (redraw && width > 0) { paint(reduced ? 9 : elapsed); redraw = false; }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); media.removeEventListener("change", changeMotion); };
  }, [run]);

  return (
    <div className="network-scene">
      <div className="scene-coordinate mono" aria-hidden="true">A QUESTION OPENS A WORLD.</div>
      <canvas ref={canvasRef} aria-hidden="true" />
      <button className="question-origin" aria-label="問いからネットワークが広がる動きをもう一度見る" onClick={() => { setRun((n) => n + 1); setPaused(false); }}>Q<span>_</span></button>
      <span className="scene-label scene-human"><i />人と学び<small>HUMAN</small></span>
      <span className="scene-label scene-knowledge"><i />知と技術<small>KNOWLEDGE</small></span>
      <span className="scene-label scene-society"><i />地域と社会<small>SOCIETY</small></span>
      <div className="scene-footer"><p>ひとつの問いから、<br />可能性はひらく。</p><button onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "動きを再開" : "動きを止める"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button></div>
    </div>
  );
}

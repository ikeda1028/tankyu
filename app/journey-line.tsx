"use client";
import { useEffect, useRef } from "react";

export default function JourneyLine() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const line = ref.current;
    const shell = line?.parentElement;
    if (!line || !shell) return;
    let frame = 0;
    const update = () => {
      const bounds = shell.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .6 - bounds.top) / bounds.height));
      line.style.setProperty("--progress", String(progress));
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(shell);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); resize.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <div className="journey-rail" ref={ref} aria-hidden="true"><span /></div>;
}

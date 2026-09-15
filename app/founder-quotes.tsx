"use client";

import { useEffect, useRef, useState } from "react";

const quotes = [
  [["組織はどんな問いで", "変わるのか。"], ["社会は、どんな問いで", "動き出すのか。"]],
  [["社会の未来をひらく", "問いとは何か。"]],
];

export default function FounderQuotes() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .35 });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (interacting || !visible || !pageVisible || reduced) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % quotes.length), 10000);
    return () => window.clearInterval(timer);
  }, [interacting, visible, pageVisible, reduced]);

  return <div className="founder-message" ref={ref} role="region" aria-label="炭谷代表の言葉" tabIndex={0}
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(ref.current === document.activeElement)}
    onFocusCapture={() => setInteracting(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
    <span className="quote-symbol" aria-hidden="true">“</span>
    <blockquote>
      <div className="founder-quote-stack" aria-live="off">
        {quotes.map((lines, index) => <p key={index} className="founder-quote-text" data-active={active === index} aria-hidden={active !== index}>
          {lines.map((phrases, line) => <span key={line}>{phrases.map((phrase) => <span className="founder-quote-phrase" key={phrase}>{phrase}</span>)}</span>)}
        </p>)}
      </div>
      <footer><span>代表理事</span><strong>炭谷 俊樹</strong></footer>
    </blockquote>
    <p className="founder-copy">個人の探究心を、組織や地域を動かす力へ。次の時代をつくるリーダーとプロジェクトを育てます。</p>
  </div>;
}

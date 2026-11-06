import React, { useEffect, useRef, useState, useLayoutEffect } from "react";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useCountUp(target, ms = 700) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (reduced() || ms <= 0) { cur.current = target; setV(target); return; }
    const from = cur.current, t0 = performance.now();
    let raf;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const x = from + (target - from) * e;
      cur.current = x; setV(x);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function Num({ v, d = 1, ms = 700, prefix = "", suffix = "", sign = false, locale = false }) {
  const x = useCountUp(Number.isFinite(v) ? v : 0, ms);
  let s = locale ? Math.round(x).toLocaleString("ko-KR") : x.toFixed(d);
  if (sign && x > 0.00001) s = "+" + s;
  return <span className="num">{prefix}{s}{suffix}</span>;
}

export const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");
export const won = (v) => "₩" + Math.round(v).toLocaleString("ko-KR");

// FLIP 레이아웃 애니메이션: key가 바뀌면 이전 위치 → 새 위치로 이동
export function useFlip(containerRef, layoutKey) {
  const els = useRef({});
  const last = useRef({});
  const reg = (id) => (el) => { if (el) els.current[id] = el; else delete els.current[id]; };
  useLayoutEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    const now = {};
    for (const [id, el] of Object.entries(els.current)) {
      const r = el.getBoundingClientRect();
      now[id] = { x: r.left - cr.left, y: r.top - cr.top };
    }
    if (!reduced()) {
      for (const [id, el] of Object.entries(els.current)) {
        const p = last.current[id], n = now[id];
        if (!p) continue;
        const dx = p.x - n.x, dy = p.y - n.y;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.getBoundingClientRect();
        el.style.transition = "transform 900ms cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "";
      }
    }
    last.current = now;
  }, [layoutKey]);
  return reg;
}

export function Section({ id, idx, title, kicker, children, actions }) {
  return (
    <section id={id} className="section">
      <header className="sec-head">
        <div>
          <div className="kicker"><span className="kidx">{idx}</span>{kicker}</div>
          <h2>{title}</h2>
        </div>
        {actions && <div className="sec-actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function Progress({ value, label }) {
  return (
    <div>
      <div className="progress" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      {label && <span className="progress-label">{label}</span>}
    </div>
  );
}

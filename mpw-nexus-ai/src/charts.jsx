import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceDot, ReferenceArea, ReferenceLine, BarChart, Bar, Cell, LabelList,
} from "recharts";
import { GROUPS, SLIDER, yieldOf, inAllowed } from "./model.js";

const AX = { fill: "#7A8594", fontSize: 12, fontFamily: "IBM Plex Sans KR, sans-serif" };

function TipBox({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tip">
      <div>{label} {unit}</div>
      <b>{payload[0].value.toFixed(2)}%</b>
    </div>
  );
}

// 그래프 A / B — 한 변수를 현재 값으로 고정한 단면 곡선
// 모든 점(기존·AI·현재)은 같은 곡선 위에 찍어, 슬라이더를 움직이면 곡선과 점이 함께 움직이도록 함
export function CurveChart({ group, axis, P, t, allowed, rec, showRec }) {
  const g = GROUPS[group];
  const isP = axis === "P";
  const fixed = isP ? t : P;
  const f = (x) => (isP ? yieldOf(group, x, fixed) : yieldOf(group, fixed, x));
  const [xMin, xMax] = isP ? [SLIDER.pMin, SLIDER.pMax] : [SLIDER.tMin, SLIDER.tMax];
  const data = useMemo(() => {
    const out = [];
    for (let x = xMin; x <= xMax + 1e-9; x += 0.5) out.push({ x, y: f(x) });
    return out;
  }, [group, axis, fixed]);
  const cur = isP ? P : t;
  const bx = isP ? g.baseline.P : g.baseline.t;
  const ax = rec ? (isP ? rec.P : rec.t) : null;
  const peak = data.reduce((m, d) => (d.y > m.y ? d : m), data[0]);
  const unit = isP ? "mTorr" : "s";
  const lo = isP ? allowed.pMin : allowed.tMin;
  const hi = isP ? allowed.pMax : allowed.tMax;
  const color = group === "P1" ? "#1F9C96" : "#C2477E";
  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 12, right: 18, bottom: 22, left: 0 }}>
          <CartesianGrid stroke="rgba(128,140,160,.22)" vertical={false} />
          <ReferenceArea x1={lo} x2={hi} fill="#D99A12" fillOpacity={0.10} stroke="none" />
          <XAxis dataKey="x" type="number" domain={[xMin, xMax]} ticks={isP ? [20, 30, 40, 50, 60, 70, 80, 90, 100] : [40, 50, 60, 70, 80, 90, 100, 110, 120]}
            tick={AX} stroke="rgba(128,140,160,.45)" allowDecimals={false}
            label={{ value: isP ? "식각 압력 (mTorr)" : "식각 시간 (s)", position: "insideBottom", offset: -12, fill: "#7A8594", fontSize: 12 }} />
          <YAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={AX} stroke="rgba(128,140,160,.45)" width={44} tickFormatter={(v) => v + "%"} />
          <Tooltip content={<TipBox unit={unit} />} cursor={{ stroke: "rgba(128,140,160,.6)" }} isAnimationActive={false} />
          <ReferenceLine x={bx} stroke="#D9534F" strokeOpacity={0.5} strokeDasharray="4 4" />
          {showRec && ax != null && <ReferenceLine x={ax} stroke="#2E9E68" strokeOpacity={0.55} strokeDasharray="4 4" />}
          <Line type="linear" dataKey="y" stroke={color} strokeWidth={2.5} dot={false} activeDot={false} isAnimationActive={false} />
          <ReferenceDot x={bx} y={f(bx)} r={6} fill="#D9534F" stroke="#ffffff" strokeWidth={2} isFront />
          {showRec && ax != null && <ReferenceDot x={ax} y={f(ax)} r={6} fill="#2E9E68" stroke="#ffffff" strokeWidth={2} isFront />}
          <ReferenceDot x={cur} y={f(cur)} r={8} fill="#ffffff" stroke={color} strokeWidth={3} isFront />
        </LineChart>
      </ResponsiveContainer>
      <div className="curve-read mono">
        <span><i className="dot ring" />현재 {cur.toFixed(1)}{unit} · {f(cur).toFixed(1)}%</span>
        <span><i className="dot red" />기존 {bx}{unit} · {f(bx).toFixed(1)}%</span>
        {showRec && ax != null && <span><i className="dot green" />AI {ax}{unit} · {f(ax).toFixed(1)}%</span>}
        <span className="muted">이 단면 최고 {peak.x}{unit} · {peak.y.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// 수율 → 색 (빨강 → 주황 → 초록)
function color(y) {
  const stops = [[0, [90, 18, 30]], [60, [210, 52, 62]], [75, [236, 140, 40]], [85, [214, 200, 60]], [93.5, [40, 206, 120]]];
  if (y <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (y <= stops[i][0]) {
      const [y0, c0] = stops[i - 1], [y1, c1] = stops[i];
      const k = (y - y0) / (y1 - y0);
      return c0.map((v, j) => v + (c1[j] - v) * k);
    }
  }
  return stops[stops.length - 1][1];
}

export const LEGEND_STOPS = [50, 60, 70, 75, 80, 85, 90, 93.5].map((y) => ({ y, c: `rgb(${color(y).map(Math.round).join(",")})` }));

// 그래프 C — 압력 × 시간 히트맵
// SVG가 화면에 그려진 폭을 재서, 줄어든 만큼 글자 크기를 키워 실제 화면에서 최소 11px을 유지
function useMinFont(ref, viewW, minPx = 11) {
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setK(viewW / w); };
    measure();
    window.addEventListener("resize", measure);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    return () => { window.removeEventListener("resize", measure); if (ro) ro.disconnect(); };
  }, [viewW]);
  return (base) => Math.max(base, minPx * k);
}
// 글자 폭 대략 추정 (한글 1em, 그 외 0.56em)
const textW = (s, f) => [...String(s)].reduce((a, c) => a + (c.charCodeAt(0) > 255 ? 1 : 0.56), 0) * f;

export function Heatmap({ group, P, t, allowed, rec, showRec, onPick, scan }) {
  const g = GROUPS[group];
  const svgRef = useRef(null);
  const fs = useMinFont(svgRef, 640);
  const W = 640, R = Math.max(16, fs(12) * 0.95), T = 14;
  const L = Math.max(58, fs(12) * 2.2 + fs(13) + 14), B = Math.max(52, fs(12) + fs(13) + 24), H = 418 + B;
  // 기존·AI 추천 꼬리표: 오른쪽 공간이 모자라면 표식 왼쪽에 붙임
  const tagX = (x, s, gap) => (x + gap + textW(s, fs(12.5)) > W - 4 ? { x: -gap, anchor: "end" } : { x: gap, anchor: "start" });
  const pw = W - L - R, ph = H - T - B;
  const sx = (p) => L + ((p - SLIDER.pMin) / (SLIDER.pMax - SLIDER.pMin)) * pw;
  const sy = (s) => T + (1 - (s - SLIDER.tMin) / (SLIDER.tMax - SLIDER.tMin)) * ph;
  const url = useMemo(() => {
    const n = 161;
    const c = document.createElement("canvas");
    c.width = n; c.height = n;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(n, n);
    for (let j = 0; j < n; j++) {
      const tt = SLIDER.tMax - (j / (n - 1)) * (SLIDER.tMax - SLIDER.tMin);
      for (let i = 0; i < n; i++) {
        const pp = SLIDER.pMin + (i / (n - 1)) * (SLIDER.pMax - SLIDER.pMin);
        let [r, gg, bb] = color(yieldOf(group, pp, tt));
        if (!inAllowed(allowed, pp, tt)) {
          const stripe = (i + j) % 6 < 2;
          const k = stripe ? 0.42 : 0.28;
          r *= k; gg *= k; bb *= k;
        }
        const o = (j * n + i) * 4;
        img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = bb; img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }, [group, allowed.pMin, allowed.pMax, allowed.tMin, allowed.tMax]);

  const m = g.model;
  const contours = [60, 70, 80, 85, 90].filter((lv) => lv < m.Ymax).map((lv) => {
    const d = Math.log(m.Ymax / lv);
    return { lv, rx: Math.sqrt(d / m.a), ry: Math.sqrt(d / m.b) };
  });
  const dragging = useRef(false);
  const pick = (e) => {
    if (!onPick) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const p = SLIDER.pMin + ((x - L) / pw) * (SLIDER.pMax - SLIDER.pMin);
    const s = SLIDER.tMin + (1 - (y - T) / ph) * (SLIDER.tMax - SLIDER.tMin);
    const snap = (v) => Math.round(v * 2) / 2;
    onPick(Math.min(SLIDER.pMax, Math.max(SLIDER.pMin, snap(p))), Math.min(SLIDER.tMax, Math.max(SLIDER.tMin, snap(s))));
  };
  const b = g.baseline;
  const pTicks = [20, 30, 40, 50, 60, 70, 80, 90, 100];
  const tTicks = [40, 50, 60, 70, 80, 90, 100, 110, 120];
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="heatmap" role="img"
      aria-label="식각 압력과 시간에 따른 예상 수율 히트맵"
      onPointerDown={(e) => { dragging.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} pick(e); }}
      onPointerMove={(e) => { if (dragging.current) pick(e); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}>
      <defs>
        <clipPath id="plotclip"><rect x={L} y={T} width={pw} height={ph} /></clipPath>
      </defs>
      <image href={url} x={L} y={T} width={pw} height={ph} preserveAspectRatio="none" style={{ imageRendering: "pixelated" }} />
      <g clipPath="url(#plotclip)">
        {contours.map((c) => (
          <g key={c.lv}>
            <ellipse cx={sx(m.P0)} cy={sy(m.t0)} rx={(c.rx / (SLIDER.pMax - SLIDER.pMin)) * pw} ry={(c.ry / (SLIDER.tMax - SLIDER.tMin)) * ph}
              fill="none" stroke="#06101d" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4 4" />
            <text x={sx(m.P0) + (c.rx / (SLIDER.pMax - SLIDER.pMin)) * pw + 4} y={sy(m.t0) - 3} className="contour-l" fontSize={fs(11)}>{c.lv}%</text>
          </g>
        ))}
        <rect x={sx(allowed.pMin)} y={sy(allowed.tMax)} width={sx(allowed.pMax) - sx(allowed.pMin)} height={sy(allowed.tMin) - sy(allowed.tMax)}
          fill="none" stroke="#e6f7ff" strokeOpacity="0.75" strokeWidth="1.5" strokeDasharray="6 4" />
        {scan != null && scan < 1 && (
          <g>
            <rect x={L} y={T} width={pw * scan} height={ph} fill="#D99A12" fillOpacity="0.12" />
            <line x1={L + pw * scan} x2={L + pw * scan} y1={T} y2={T + ph} stroke="#D99A12" strokeWidth="2" />
          </g>
        )}
        <line x1={sx(P)} x2={sx(P)} y1={T} y2={T + ph} stroke="#fff" strokeOpacity="0.45" strokeDasharray="3 4" />
        <line x1={L} x2={L + pw} y1={sy(t)} y2={sy(t)} stroke="#fff" strokeOpacity="0.45" strokeDasharray="3 4" />
      </g>
      <text x={sx(allowed.pMin) + 6} y={sy(allowed.tMax) + 4 + fs(12)} className="hm-allowed" fontSize={fs(12)}>{group} 그룹 허용 범위</text>
      {/* 기존 조건 */}
      {(() => { const s = `기존 ${b.P} mTorr / ${b.t} s`, p = tagX(sx(b.P), s, 13); return (
        <g transform={`translate(${sx(b.P)},${sy(b.t)})`}>
          <circle r="9" fill="#D9534F" stroke="#ffffff" strokeWidth="2.5" />
          <text x={p.x} y={fs(12.5) * 0.35} textAnchor={p.anchor} className="hm-tag" fontSize={fs(12.5)}>{s}</text>
        </g>); })()}
      {showRec && rec && (() => { const s = `AI 추천 ${rec.P} mTorr / ${rec.t} s`, p = tagX(sx(rec.P), s, 14); return (
        <g transform={`translate(${sx(rec.P)},${sy(rec.t)})`}>
          <path d="M0,-12 L3.5,-3.5 L12,0 L3.5,3.5 L0,12 L-3.5,3.5 L-12,0 L-3.5,-3.5Z" fill="#2E9E68" stroke="#ffffff" strokeWidth="2" />
          <text x={p.x} y={-6} textAnchor={p.anchor} className="hm-tag" fontSize={fs(12.5)}>{s}</text>
        </g>); })()}
      <g transform={`translate(${sx(P)},${sy(t)})`} className="hm-cur">
        <circle r="11" fill="none" stroke="#fff" strokeWidth="2.5" />
        <circle r="3" fill="#fff" />
      </g>
      {pTicks.map((v) => (
        <g key={"p" + v}>
          <line x1={sx(v)} x2={sx(v)} y1={T + ph} y2={T + ph + 5} stroke="rgba(128,140,160,.6)" />
          <text x={sx(v)} y={T + ph + 7 + fs(12)} textAnchor="middle" className="ax" fontSize={fs(12)}>{v}</text>
        </g>
      ))}
      {tTicks.map((v) => (
        <g key={"t" + v}>
          <line x1={L - 5} x2={L} y1={sy(v)} y2={sy(v)} stroke="rgba(128,140,160,.6)" />
          <text x={L - 9} y={sy(v) + fs(12) * 0.35} textAnchor="end" className="ax" fontSize={fs(12)}>{v}</text>
        </g>
      ))}
      <text x={L + pw / 2} y={H - 8} textAnchor="middle" className="ax-title" fontSize={fs(13)}>식각 압력 (mTorr)</text>
      <text transform={`translate(${4 + fs(13)},${T + ph / 2}) rotate(-90)`} textAnchor="middle" className="ax-title" fontSize={fs(13)}>식각 시간 (s)</text>
    </svg>
  );
}

// 간트 차트
export function Gantt({ sim, orders, maxH, title, accent }) {
  const W = 900, rowH = 30, L = 120, R = 36, T = 30;
  const ids = orders.map((o) => o.id);
  const H = T + (ids.length + 1) * rowH + 30;
  const sx = (h) => L + (h / maxH) * (W - L - R);
  const days = Math.ceil(maxH / 24);
  const step = days > 16 ? 2 : 1;
  const rowOf = (id) => ids.indexOf(id);
  return (
    <div className="gantt-wrap">
      <div className="gantt-title"><span style={{ background: accent }} />{title}</div>
      <p className="scroll-hint">차트를 옆으로 밀어 전체 일정을 볼 수 있습니다.</p>
      <div className="scroll-x gantt-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="gantt" role="img" aria-label={title}>
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="rgba(217,83,79,.15)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#D9534F" strokeWidth="2.5" />
            </pattern>
          </defs>
          {Array.from({ length: Math.floor(days / step) + 1 }, (_, i) => i * step).map((d) => (
            <g key={d}>
              <line x1={sx(d * 24)} x2={sx(d * 24)} y1={T - 6} y2={H - 26} stroke="rgba(128,140,160,.22)" />
              <text x={sx(d * 24)} y={T - 12} textAnchor="middle" className="ax">D{d}</text>
            </g>
          ))}
          {ids.map((id, i) => {
            const o = orders.find((x) => x.id === id);
            return (
              <g key={id}>
                <text x={10} y={T + i * rowH + 19} className="g-label">{o.company}</text>
                <text x={L - 10} y={T + i * rowH + 19} textAnchor="end" className={"g-grp " + o.group}>{o.group} 그룹</text>
                <line x1={sx(o.due * 24)} x2={sx(o.due * 24)} y1={T + i * rowH + 3} y2={T + i * rowH + rowH - 3} stroke="#D99A12" strokeWidth="2" />
                <path d={`M${sx(o.due * 24) - 5},${T + i * rowH + 1} h10 l-5,6z`} fill="#D99A12" />
              </g>
            );
          })}
          <text x={10} y={T + ids.length * rowH + 19} className="g-label muted">장비 전환</text>
          {sim.blocks.map((b, k) => {
            if (b.type === "change") {
              return (
                <rect key={k} x={sx(b.start)} y={T + ids.length * rowH + 5} width={Math.max(3, sx(b.end) - sx(b.start))} height={rowH - 10}
                  fill="url(#hatch)" stroke="#D9534F" strokeWidth="1" rx="2" />
              );
            }
            const i = rowOf(b.id);
            const late = b.late > 1e-9;
            const lbl = `${(b.end / 24).toFixed(1)}일 완료${late ? " · 지연" : ""}`;
            // 오른쪽 끝을 넘으면 막대 시작점 왼쪽으로 옮겨 잘리거나 겹치지 않게
            const lw = textW(lbl, 11.5);
            const pos = sx(b.end) + 6 + lw <= W - 2 ? "after" : sx(b.start) - 6 - lw >= L ? "before" : "inside";
            const lx = pos === "after" ? sx(b.end) + 6 : pos === "before" ? sx(b.start) - 6 : sx(b.end) - 6;
            return (
              <g key={k}>
                <rect x={sx(b.start)} y={T + i * rowH + 5} width={sx(b.end) - sx(b.start)} height={rowH - 10} rx="4"
                  fill={b.group === "P1" ? "#1F9C96" : "#C2477E"} stroke={late ? "#D9534F" : b.group === "P1" ? "#1F9C96" : "#C2477E"} strokeWidth={late ? 2.5 : 1.2} />
                <text x={lx} textAnchor={pos === "after" ? "start" : "end"} y={T + i * rowH + 19}
                  className={"g-bar" + (late ? " late" : "") + (pos === "inside" ? " in" : "")}>{lbl}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function CompareBars({ data, unit, digits = 1, domain }) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 4 }}>
        <XAxis type="number" hide domain={domain || [0, "auto"]} />
        <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#7A8594", fontSize: 13 }} axisLine={false} tickLine={false} />
        <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={22} isAnimationActive>
          {data.map((d, i) => <Cell key={i} fill={d.c} />)}
          <LabelList dataKey="v" position="right" formatter={(v) => v.toFixed(digits) + unit} fill="#7A8594" fontSize={13} fontFamily="IBM Plex Sans KR, sans-serif" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

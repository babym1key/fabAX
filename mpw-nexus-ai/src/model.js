// ───────────────────────────────────────────────────────────────
// MPW NEXUS AI — 교육용 가상 공정 모델 (실측 데이터 아님)
// ───────────────────────────────────────────────────────────────

export const SLIDER = { pMin: 20, pMax: 100, tMin: 40, tMax: 120 };

// 수율 모델: Y(P,t) = clamp(Ymax - a(P-P*)^2 - b(t-t*)^2, 0, 100)
// P1: 요청 원식(0.008, 0.016)은 기존 조건(60,75)에서 90.9%가 되므로
//     계수 비율 1:2 를 유지한 채 기존 조건이 정확히 85.0%가 되도록 보정.
//     225a + 49·(2a) = 323a = 8.5  →  a = 8.5/323 ≈ 0.02632, b = 2a ≈ 0.05263
// P2: 최적 55 mTorr / 82 s / 91.0%, 기존 70 mTorr / 90 s → 84.0%
//     225a + 64·(1.5a) = 321a = 7.0 → a = 7/321 ≈ 0.02181, b = 1.5a ≈ 0.03271
// [수정] 이차식은 기준점 두 개를 맞추면 계수가 커져서, 조건이 조금만 멀어져도 수율이 0%에 붙어
//        곡선이 평평해지고 꺾입니다. 같은 기준점을 지나는 가우시안형으로 바꿨습니다.
// Y(P,t) = Ymax · exp(−[a(P−P*)² + b(t−t*)²])
// P1: 기존(60,75) = 85.0% → 323a = ln(93.5/85.0)
// P2: 기존(70,90) = 84.0% → 321a = ln(91/84)
const a1 = Math.log(93.5 / 85.0) / 323;
const a2 = Math.log(91.0 / 84.0) / 321;

// 주문 단계에서 고객이 지정하는 공정 조건 (그룹은 정하지 않음)
export const PLATFORMS = [
  { key: "CMOS", label: "0.18µm 저전력 CMOS" },
  { key: "BCD", label: "0.18µm BCD 고전압" },
];
export const MATERIALS = [
  { key: "POLY", label: "Poly-Si 게이트 / SiO₂" },
  { key: "METAL", label: "후막 금속 / 고종횡비 트렌치" },
  { key: "TIN", label: "TiN 하드마스크 / 배리어" },
];
export const labelOf = (list, key) => (list.find((x) => x.key === key) || {}).label || key;

export const GROUPS = {
  P1: {
    id: "P1",
    platformKey: "CMOS",
    materialKey: "POLY",
    materials: ["POLY", "TIN"], // TiN은 Cl₂/HBr 계열로도 식각 가능
    name: "P1 그룹 · 저전력 CMOS 플랫폼",
    platform: "0.18µm 저전력 CMOS (기본 플랫폼 A)",
    material: "Poly-Si 게이트 / SiO₂ 절연막 식각 · TiN",
    tool: "ICP 식각 챔버 #1 · Cl₂/HBr 계열",
    color: "var(--p1)",
    model: { Ymax: 93.5, P0: 45, t0: 68, a: a1, b: 2 * a1 },
    baseline: { P: 60, t: 75 },
    allowed: { pMin: 30, pMax: 75, tMin: 50, tMax: 95 },
  },
  P2: {
    id: "P2",
    platformKey: "BCD",
    materialKey: "METAL",
    materials: ["METAL", "TIN"], // TiN 배리어는 Cl₂/BCl₃ 계열로 식각
    name: "P2 그룹 · BCD 고전압 플랫폼",
    platform: "0.18µm BCD 고전압 (기본 플랫폼 B)",
    material: "후막 금속 배선 / 고종횡비 트렌치 식각 · TiN",
    tool: "ICP 식각 챔버 #2 · Cl₂/BCl₃ 계열",
    color: "var(--p2)",
    model: { Ymax: 91.0, P0: 55, t0: 82, a: a2, b: 1.5 * a2 },
    baseline: { P: 70, t: 90 },
    allowed: { pMin: 35, pMax: 85, tMin: 60, tMax: 110 },
  },
};

// 2단계 공정 호환성 분석: 플랫폼·식각 재료가 모두 맞는 표준 공정 그룹을 찾음 (없으면 null = 배정 보류)
export function classifyOrder(o) {
  const g = Object.values(GROUPS).find((G) => G.platformKey === o.platform && (G.materialKey === o.material || (G.materials || []).includes(o.material)));
  return g ? g.id : null;
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function yieldOf(groupId, P, t) {
  const m = GROUPS[groupId].model;
  return clamp(m.Ymax * Math.exp(-(m.a * (P - m.P0) ** 2 + m.b * (t - m.t0) ** 2)), 0, 100);
}

export const inAllowed = (al, P, t) =>
  P >= al.pMin && P <= al.pMax && t >= al.tMin && t <= al.tMax;

// AI 레시피 탐색: 슬라이더 전 범위를 0.5 단위 격자로 전수 평가,
// 허용 범위 밖 조합은 후보에서 제외, 동률이면 더 짧은 식각 시간 → 낮은 압력 우선.
export function searchRecipe(groupId, allowed, step = 0.5) {
  let best = null, evaluated = 0, excluded = 0;
  for (let P = SLIDER.pMin; P <= SLIDER.pMax + 1e-9; P += step) {
    for (let t = SLIDER.tMin; t <= SLIDER.tMax + 1e-9; t += step) {
      evaluated++;
      if (!inAllowed(allowed, P, t)) { excluded++; continue; }
      const y = yieldOf(groupId, P, t);
      if (!best || y > best.y + 1e-9 || (Math.abs(y - best.y) < 1e-9 && (t < best.t || (t === best.t && P < best.P)))) {
        best = { P: +P.toFixed(1), t: +t.toFixed(1), y };
      }
    }
  }
  const m = GROUPS[groupId].model;
  const unconstrained = { P: m.P0, t: m.t0 };
  const bounded = best && (Math.abs(best.P - m.P0) > 0.01 || Math.abs(best.t - m.t0) > 0.01);
  return { ...best, evaluated, excluded, candidates: evaluated - excluded, bounded, unconstrained };
}

// ── 생산 런 스케줄 ─────────────────────────────────────────────
export const runHours = (qty, sch) => sch.setupH + qty * sch.perChipH;

export function simulate(seq, orders, sch) {
  let tH = 0, changes = 0, prev = null;
  const blocks = [];
  for (const id of seq) {
    const o = orders.find((x) => x.id === id);
    if (prev && prev !== o.group) {
      const c = sch.changeMin / 60;
      blocks.push({ type: "change", start: tH, end: tH + c, from: prev, to: o.group });
      tH += c; changes++;
    }
    const d = runHours(o.qty, sch);
    const due = o.due * 24;
    blocks.push({ type: "run", id, group: o.group, start: tH, end: tH + d, due, late: tH + d - due });
    tH += d; prev = o.group;
  }
  const runs = blocks.filter((b) => b.type === "run");
  const tardy = runs.reduce((s, b) => s + Math.max(0, b.late), 0);
  const lateIds = runs.filter((b) => b.late > 1e-9).map((b) => b.id);
  const dues = seq.map((id) => orders.find((o) => o.id === id).due);
  let inv = 0;
  for (let i = 0; i < dues.length; i++) for (let j = i + 1; j < dues.length; j++) if (dues[i] > dues[j]) inv++;
  const flow = runs.reduce((s, b) => s + b.end, 0);
  return { seq, blocks, makespan: tH, changes, changeMin: changes * sch.changeMin, tardy, lateIds, inv, flow };
}

function permutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  arr.forEach((x, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([x, ...p]);
  });
  return out;
}

const lex = (keys) => (A, B) => {
  for (const k of keys) { const d = A[k] - B[k]; if (Math.abs(d) > 1e-9) return d; }
  return 0;
};

// 전 순열 탐색. 목적함수(사전식):
// ① 총 납기 지연시간 최소 ② 그룹 전환 횟수 최소 ③ 납기 순서 역전 최소 ④ 평균 완료시각 최소
export function optimizeSchedule(orders, sch) {
  const ids = orders.map((o) => o.id);
  const all = permutations(ids).map((p) => simulate(p, orders, sch));
  const best = all.slice().sort(lex(["tardy", "changes", "inv", "flow"]))[0];
  // 비교용: 전환 횟수만 최소화했을 때 (납기 무시)
  const changeOnly = all.slice().sort(lex(["changes", "inv", "flow"]))[0];
  return { best, changeOnly, evaluated: all.length };
}

// ── 호환성 판정 ──────────────────────────────────────────────
export const RETICLE_MM2 = 26 * 33; // 표준 레티클 최대 노광 영역

export function classify(orders) {
  const groups = {};
  for (const o of orders) (groups[o.group] ||= []).push(o);
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([gid, list]) => {
      const area = list.reduce((s, o) => s + o.w * o.h, 0);
      return { gid, list, area, util: area / RETICLE_MM2, qty: list.reduce((s, o) => s + o.qty, 0) };
    });
}

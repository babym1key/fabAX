// ───────────────────────────────────────────────────────────────
// FabShare MPW AI 배치 — 그룹(P1/P2)별 웨이퍼 집적 시뮬레이션
// 가격·일정은 Europractice 2026 X-FAB XP018 공시가 기준, 나머지는 가정치
// ───────────────────────────────────────────────────────────────

export const MPW_DEFAULTS = {
  price: { v: 1126, l: "MPW 단가 (€/mm², 공시 · XP018 4M 기본)" },
  minArea: { v: 10, l: "최소 과금 면적 (mm², 공시)" },
  incl: { v: 50, l: "기본 납품 다이 (개, 공시)" },
  extraDie: { v: 25, l: "추가 다이 단가 (€/개, 공시)" },
  verify: { v: 1000, l: "4개 이상 설계 묶음 검증비 (€, 공시)" },
  subdice: { v: 5, l: "분리 절단 추가 다이당 (€)", step: 0.5 },
  service: { v: 1000, l: "FabShare 배치·검증 수수료 (€, 가정)" },
  gap: { v: 0.1, l: "다이 사이 간격 (mm, 가정)", step: 0.05 },
  eur: { v: 1506, l: "환율 (원/€, 2026.11.5 하나은행 매매기준율)" },
  prepInd: { v: 12, l: "개별 신청 준비 기간 (주, 가정)" },
  prepAi: { v: 2, l: "AI 공동 배치 준비 기간 (주, 가정)" },
  cadence: { v: 17, l: "셔틀 간격 (주, 연 3회)" },
  lead: { v: 23, l: "테이프인→샘플 출하 (주, X-FAB 2026 일정)" },
  copies: { v: 3, l: "가공 배수: 납품 다이 대비 실제 가공 블록 (배, 가정)", step: 0.5 },
  perYear: { v: 30, l: "연간 공동 배치 건수 (가정)" },
  water: { v: 8.22, l: "웨이퍼 cm²당 물 (L)", step: 0.01 },
  kwh: { v: 1.15, l: "웨이퍼 cm²당 전력 (kWh)", step: 0.01 },
  co2: { v: 0.84, l: "웨이퍼 cm²당 온실가스 (kgCO₂e)", step: 0.01 },
};
export const mpwInit = () => Object.fromEntries(Object.entries(MPW_DEFAULTS).map(([k, x]) => [k, x.v]));
export const MAX_QTY = 100;

/* ---------- wafer geometry (concept view) ---------- */
export const D = 26;
const R = D / 2, EDGE = 0.6;
export const usable = new Uint8Array(D * D);
for (let r = 0; r < D; r++) for (let c = 0; c < D; c++) {
  let ok = true;
  for (const [x, y] of [[c, r], [c + 1, r], [c, r + 1], [c + 1, r + 1]]) if ((x - R) ** 2 + (y - R) ** 2 > (R - EDGE) ** 2) ok = false;
  if (r >= D - 2 && c >= R - 1 && c <= R) ok = false; // notch
  usable[r * D + c] = ok ? 1 : 0;
}
const cl = (v) => Math.min(4, Math.max(1, Math.round(v / 1.1)));
export const cellsOf = (o) => ({ cw: cl(o.w), ch: cl(o.h) });
const makeGrid = () => new Int32Array(D * D).fill(-1);
function fits(g, x, y, w, h) {
  if (x < 0 || y < 0 || x + w > D || y + h > D) return false;
  for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) { const i = r * D + c; if (!usable[i] || g[i] !== -1) return false; }
  return true;
}
function mark(g, p, id) { for (let r = p.y; r < p.y + p.h; r++) for (let c = p.x; c < p.x + p.w; c++) g[r * D + c] = id; }
function findPos(g, w, h) {
  const orients = w === h ? [[w, h]] : [[w, h], [h, w]];
  for (let b = D - 1; b >= 0; b--) for (let c = 0; c < D; c++) for (const [ww, hh] of orients) {
    const top = b - hh + 1; if (top < 0) continue;
    if (fits(g, c, top, ww, hh)) return { x: c, y: top, w: ww, h: hh };
  }
  return null;
}
export const keyOf = (list) => list.map((o) => `${o.id}${o.w}x${o.h}:${o.qty}`).join("|");

// 같은 그룹 주문만 한 웨이퍼에 섞어 배치 (비율대로 교차 → 큰 칩 먼저, 아래부터 쌓기)
export function pack(list) {
  let grid = makeGrid(); const pieces = [];
  const left = {}, total = list.reduce((s, o) => s + o.qty, 0), seq = [];
  list.forEach((o) => (left[o.id] = o.qty));
  for (let i = 0; i < total; i++) {
    let best = null, bs = -1;
    list.forEach((o) => { const sc = left[o.id] / o.qty; if (left[o.id] > 0 && sc > bs) { bs = sc; best = o; } });
    left[best.id]--; seq.push(best);
  }
  const area = (o) => { const { cw, ch } = cellsOf(o); return cw * ch; };
  const big = seq.filter((o) => area(o) > 2), small = seq.filter((o) => area(o) <= 2);
  const counts = {};
  for (const o of [...big, ...small]) {
    const { cw, ch } = cellsOf(o);
    const pos = findPos(grid, cw, ch); if (!pos) continue;
    const p = { ...pos, id: o.id, n: (counts[o.id] = (counts[o.id] || 0) + 1) };
    mark(grid, p, pieces.length); pieces.push(p);
  }
  pieces.sort((a, b) => (b.y + b.h) - (a.y + a.h) || a.x - b.x);
  grid = makeGrid(); pieces.forEach((p, i) => mark(grid, p, i));
  for (let r = 0; r < D; r++) for (let c = 0; c < D; c++) {
    const i = r * D + c;
    if (usable[i] && grid[i] === -1) { grid[i] = pieces.length; pieces.push({ x: c, y: r, w: 1, h: 1, teg: true }); }
  }
  return { pieces, grid, counts };
}

// 빈자리에 더 넣을 수 있는 칩(깜빡이는 추천)
export function suggest(pieces, list) {
  const sugg = [], sgrid = makeGrid(), g = makeGrid();
  pieces.forEach((p, i) => { if (!p.teg) mark(g, p, i); });
  const cands = list.slice().sort((a, b) => { const A = cellsOf(a), B = cellsOf(b); return B.cw * B.ch - A.cw * A.ch; });
  let prog = true;
  while (prog) {
    prog = false;
    for (const o of cands) {
      const { cw, ch } = cellsOf(o); const pos = findPos(g, cw, ch);
      if (pos) { const s = { ...pos, id: o.id }; mark(g, s, 99999); mark(sgrid, s, sugg.length); sugg.push(s); prog = true; }
    }
  }
  const covered = pieces.map((p) => p.teg && sgrid[p.y * D + p.x] !== -1);
  return { sugg, sgrid, covered };
}

// 추천 반영을 한 번에: 더 넣을 칩이 없을 때까지 반복해 최종 수량 계산
export function fillAll(list) {
  const q = Object.fromEntries(list.map((o) => [o.id, o.qty]));
  const L = () => list.map((o) => ({ ...o, qty: q[o.id] }));
  const cap = () => { const { counts } = pack(L()); list.forEach((o) => { if (q[o.id] > (counts[o.id] || 0)) q[o.id] = counts[o.id] || 0; }); };
  for (let i = 0; i < 40; i++) {
    cap();
    const { pieces } = pack(L()); const { sugg } = suggest(pieces, L());
    if (!sugg.length) break;
    let changed = false;
    sugg.forEach((s) => { if (q[s.id] < MAX_QTY) { q[s.id]++; changed = true; } });
    if (!changed) break;
  }
  cap();
  return q;
}

/* ---------- AI 블록 패커 (실제 mm) ---------- */
function perms(a) { if (a.length <= 1) return [a]; const r = []; a.forEach((x, i) => perms(a.filter((_, j) => j !== i)).forEach((p) => r.push([x, ...p]))); return r; }
export function packBlock(list, gap) {
  if (!list.length) return null;
  const S = 0.1, U = (v) => Math.round(v / S);
  const items = list.map((o) => ({ o, w: U(o.w + gap), h: U(o.h + gap) }));
  const maxW = items.reduce((s, i) => s + Math.max(i.w, i.h), 0);
  let best = null;
  for (const ord of perms(items)) {
    for (let m = 0; m < (1 << ord.length); m++) {
      const its = ord.map((it, k) => ((m >> k) & 1 ? { ...it, w: it.h, h: it.w, rot: true } : { ...it, rot: false }));
      const need = Math.max(...its.map((i) => i.w));
      for (let W = need; W <= maxW; W++) {
        const sky = new Array(W).fill(0), pl = []; let H = 0;
        for (const it of its) {
          let bx = -1, by = 1e9;
          for (let x = 0; x + it.w <= W; x++) { let y = 0; for (let k = x; k < x + it.w; k++) if (sky[k] > y) y = sky[k]; if (y < by) { by = y; bx = x; } }
          for (let k = bx; k < bx + it.w; k++) sky[k] = by + it.h;
          pl.push({ ...it, x: bx, y: by }); if (by + it.h > H) H = by + it.h;
        }
        const wmm = W * S, hmm = H * S, area = wmm * hmm;
        if (Math.max(wmm, hmm) / Math.min(wmm, hmm) > 3) continue;
        if (!best || area < best.area - 1e-9) best = { W: wmm, H: hmm, area, pl: pl.map((p) => ({ o: p.o, rot: p.rot, x: p.x * S, y: p.y * S })) };
      }
    }
  }
  return best;
}

/* ---------- 비용·면적·환경 계산 ---------- */
export function mpwCalc(list, P) {
  if (!list.length) return null;
  const block = packBlock(list, P.gap);
  const n = list.length;
  const designArea = list.reduce((s, o) => s + o.w * o.h, 0);
  const chips = list.reduce((s, o) => s + o.qty, 0);
  const per = list.map((o) => {
    const charged = Math.max(P.minArea, Math.ceil(o.w * o.h - 1e-9));
    const extra = Math.max(0, o.qty - P.incl);
    return { o, charged, extra, cost: charged * P.price + extra * P.extraDie };
  });
  const convCharged = per.reduce((s, x) => s + x.charged, 0);
  const convCost = per.reduce((s, x) => s + x.cost, 0);
  const aiCharged = Math.max(P.minArea, Math.ceil(block.area - 1e-9));
  const maxQty = Math.max(...list.map((o) => o.qty));
  const extraBlocks = Math.max(0, maxQty - P.incl), blocks = P.incl + extraBlocks;
  const aiFab = aiCharged * P.price, aiVerify = n >= 4 ? P.verify : 0, aiExtra = extraBlocks * P.extraDie;
  const aiSub = blocks * (n - 1) * P.subdice, aiService = P.service;
  const aiCost = aiFab + aiVerify + aiExtra + aiSub + aiService;
  const shared = aiFab + aiVerify + aiService;
  const needSum = list.filter((o) => o.qty > P.incl).reduce((s, o) => s + o.qty - P.incl, 0);
  per.forEach((x) => {
    let s = shared * (x.o.w * x.o.h) / designArea + aiSub / n;
    if (x.o.qty > P.incl && needSum > 0) s += aiExtra * (x.o.qty - P.incl) / needSum;
    x.share = s;
    x.needConv = x.cost * x.o.qty / Math.max(P.incl, x.o.qty);
    x.needAi = x.share * x.o.qty / blocks;
  });
  const needConv = per.reduce((s, x) => s + x.needConv, 0), needAi = per.reduce((s, x) => s + x.needAi, 0);
  const useful = list.reduce((s, o) => s + o.w * o.h * o.qty, 0);
  const convBuy = per.reduce((s, x) => s + x.charged * Math.max(P.incl, x.o.qty), 0);
  const aiBuy = aiCharged * blocks;
  const savedCm2 = Math.max(0, convBuy - aiBuy) / 100 * P.copies;
  const aiEmpty = (aiCharged - designArea) / aiCharged;
  const tInd = P.prepInd + P.cadence / 2 + P.lead, tAi = P.prepAi + P.cadence / 2 + P.lead;
  return { block, n, designArea, chips, per, convCharged, convCost, aiCharged, aiCost, aiEmpty, needConv, needAi, useful, convBuy, aiBuy, savedCm2, tInd, tAi, blocks };
}

export const nf = (v, d = 0) => Number(v).toLocaleString("ko-KR", { maximumFractionDigits: d, minimumFractionDigits: d });
export function manwon(eurVal, rate) {
  const v = Math.round(eurVal * rate / 10000); const e = Math.floor(v / 10000), m = v % 10000;
  if (e > 0) return `${e}억${m ? " " + m.toLocaleString("ko-KR") + "만" : ""}원`;
  return `${m.toLocaleString("ko-KR")}만원`;
}

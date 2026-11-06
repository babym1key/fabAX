import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GROUPS, SLIDER, yieldOf, inAllowed, searchRecipe, simulate, optimizeSchedule, classify, runHours, RETICLE_MM2,
  PLATFORMS, MATERIALS, labelOf, classifyOrder,
} from "./model.js";
import { Num, fmt, won, sleep, reduced, useFlip, Section, Progress } from "./ui.jsx";
import { CurveChart, Heatmap, Gantt, CompareBars, LEGEND_STOPS } from "./charts.jsx";
import MpwPlace from "./MpwPlace.jsx";
import { pack, suggest, keyOf, fillAll, mpwInit, mpwCalc, manwon } from "./mpw.js";

const INIT_ORDERS = [
  { id: "A", company: "A사", chip: "NS-A1 신경신호 처리 ASIC", w: 2.5, h: 2.5, qty: 36, platform: "CMOS", material: "POLY", due: 7 },
  { id: "B", company: "B사", chip: "IB-B2 이식형 생체신호 감지 ASIC", w: 1.2, h: 2.0, qty: 40, platform: "CMOS", material: "POLY", due: 10 },
  { id: "C", company: "C사", chip: "MA-C3 근전도 신호증폭 ASIC", w: 2.0, h: 3.0, qty: 43, platform: "BCD", material: "METAL", due: 8 },
  { id: "D", company: "D사", chip: "MB-D4 대사 바이오센서 ASIC", w: 1.5, h: 2.0, qty: 46, platform: "BCD", material: "METAL", due: 12 },
  { id: "E", company: "E사", chip: "CR-E5 심박 모니터링 ASIC", w: 2.0, h: 2.0, qty: 31, platform: "CMOS", material: "TIN", due: 14 },
];
const INIT_BASE_SEQ = ["A", "C", "B", "E", "D"];
const INIT_SCH = { changeMin: 120, setupH: 7.2, perChipH: 0.12 };
const INIT_COST = { etchRate: 800000, lineRate: 1500000, wafers: 25, steps: 8 };
const baseCur = () => ({ P1: { ...GROUPS.P1.baseline }, P2: { ...GROUPS.P2.baseline } });
const baseAllowed = () => ({ P1: { ...GROUPS.P1.allowed }, P2: { ...GROUPS.P2.allowed } });

const NAV = [
  ["overview", "Overview", "전체 주문 현황"],
  ["compat", "Compatibility AI", "공정 호환성 분류"],
  ["mpw", "MPW AI Placement", "그룹별 웨이퍼 AI 배치"],
  ["recipe", "Recipe Optimizer", "식각 레시피 최적화"],
  ["yield", "Yield Simulator", "압력·시간 수율 그래프"],
  ["schedule", "Production Scheduler", "생산 런 순서 최적화"],
  ["impact", "AI Impact Report", "개선 효과"],
];

const COMPAT_STEPS = [
  "주문 데이터 로딩",
  "기본 공정 플랫폼 대조",
  "식각 대상 재료 대조",
  "장비·레시피 허용 범위 대조",
  "레티클 면적 점검 및 그룹 확정",
];

export default function App() {
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [compat, setCompat] = useState({ status: "idle", step: -1, scanning: null });
  const [group, setGroup] = useState("P1");
  const [cur, setCur] = useState(baseCur);
  const [allowed, setAllowed] = useState(baseAllowed);
  const [recRun, setRecRun] = useState({ P1: false, P2: false });
  const [search, setSearch] = useState(null); // {group, progress}
  const [baseSeq, setBaseSeq] = useState(INIT_BASE_SEQ);
  const [sch, setSch] = useState(INIT_SCH);
  const [schedRun, setSchedRun] = useState(false);
  const [schedAnim, setSchedAnim] = useState(null);
  const [cost, setCost] = useState(INIT_COST);
  const [full, setFull] = useState({ running: false, stage: -1, done: false });
  const [active, setActive] = useState("overview");
  const [place, setPlace] = useState({ P1: null, P2: null });
  const [placeBusy, setPlaceBusy] = useState(null);
  const [mp, setMp] = useState(mpwInit);
  const busy = compat.status === "running" || !!search || schedAnim != null || full.running || !!placeBusy;

  const curRef = useRef(cur); curRef.current = cur;

  // ── 파생 계산 (입력 변경 시 즉시 재계산) ──
  // 공정 그룹은 주문에서 정하지 않고, 플랫폼·식각 재료 조건으로 판정
  const allOrders = useMemo(() => orders.map((o) => ({ ...o, group: classifyOrder(o) })), [orders]);
  const valid = useMemo(() => allOrders.filter((o) => o.group), [allOrders]);
  const held = useMemo(() => allOrders.filter((o) => !o.group), [allOrders]);
  const compatDone = compat.status === "done";
  const groups = useMemo(() => classify(valid), [valid]);
  const baseSeqEff = useMemo(() => baseSeq.filter((id) => valid.some((o) => o.id === id)), [baseSeq, valid]);
  const recs = useMemo(() => ({ P1: searchRecipe("P1", allowed.P1), P2: searchRecipe("P2", allowed.P2) }), [allowed]);
  const baseSim = useMemo(() => simulate(baseSeqEff, valid, sch), [baseSeqEff, valid, sch]);
  const opt = useMemo(() => optimizeSchedule(valid, sch), [valid, sch]);

  // 왼쪽 메뉴로 화면 전환 (#overview, #compat … 해시로 북마크 가능)
  useEffect(() => {
    const read = () => { const h = location.hash.slice(1); if (NAV.some(([id]) => id === h)) setActive(h); };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const go = (id) => {
    setActive(id);
    try { if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id); } catch (e) {}
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // ── 1. 호환성 분석 ──
  const runCompat = useCallback(async () => {
    setCompat({ status: "running", step: 0, scanning: null });
    const fast = reduced();
    for (let s = 0; s < COMPAT_STEPS.length; s++) {
      setCompat((c) => ({ ...c, step: s }));
      if (s === 1 || s === 2) {
        for (const o of orders) { setCompat((c) => ({ ...c, scanning: o.id })); await sleep(fast ? 20 : 150); }
        setCompat((c) => ({ ...c, scanning: null }));
      } else await sleep(fast ? 40 : 420);
    }
    setCompat({ status: "done", step: COMPAT_STEPS.length, scanning: null });
    await sleep(fast ? 50 : 950);
  }, [orders]);

  // ── 1-2. MPW AI 배치 (같은 그룹 칩만 한 웨이퍼 블록에) ──
  const runPlace = useCallback(async (g, override) => {
    const list = (override || valid.filter((o) => o.group === g)).filter((o) => o.qty > 0);
    if (!list.length) return;
    const { pieces } = pack(list);
    const { sugg, covered } = suggest(pieces, list);
    const real = pieces.filter((x) => !x.teg).length, stag = Math.min(16, 2600 / Math.max(1, real));
    let i = 0;
    pieces.forEach((x) => { x.t0 = x.teg ? real * stag + 420 * 0.6 + Math.random() * 300 : (i++) * stag; });
    const dur = reduced() ? 0 : real * stag + 420 + 950;
    setPlaceBusy(g);
    setPlace((pl) => ({ ...pl, [g]: { key: keyOf(list), pieces, sugg, covered, start: performance.now(), running: dur > 0 } }));
    await sleep(dur);
    setPlace((pl) => (pl[g] ? { ...pl, [g]: { ...pl[g], running: false } } : pl));
    setPlaceBusy(null);
  }, [valid]);

  const applySugg = useCallback((g) => {
    const list = valid.filter((o) => o.group === g && o.qty > 0);
    const q = fillAll(list);
    setOrders((os) => os.map((o) => (q[o.id] != null ? { ...o, qty: Math.max(1, q[o.id]) } : o)));
    runPlace(g, list.map((o) => ({ ...o, qty: Math.max(1, q[o.id]) })));
  }, [valid, runPlace]);

  const mpwRes = useMemo(() => {
    const out = {};
    for (const g of ["P1", "P2"]) {
      const L = valid.filter((o) => o.group === g && o.qty > 0);
      const pl = place[g];
      out[g] = { r: mpwCalc(L, mp), done: !!(pl && !pl.running && L.length && pl.key === keyOf(L)) };
    }
    return out;
  }, [valid, place, mp]);

  // ── 2. 레시피 탐색 + 슬라이더 이동 ──
  const animateTo = (g, target, ms) => new Promise((resolve) => {
    const from = { ...curRef.current[g] };
    if (reduced()) { setCur((c) => ({ ...c, [g]: { P: target.P, t: target.t } })); return resolve(); }
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      const P = Math.round((from.P + (target.P - from.P) * e) * 2) / 2;
      const t = Math.round((from.t + (target.t - from.t) * e) * 2) / 2;
      setCur((c) => ({ ...c, [g]: k < 1 ? { P, t } : { P: target.P, t: target.t } }));
      if (k < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });

  const runRecipe = useCallback(async (g) => {
    const rec = searchRecipe(g, allowed[g]);
    const ms = reduced() ? 0 : 1100, t0 = performance.now();
    while (true) {
      const k = ms ? Math.min(1, (performance.now() - t0) / ms) : 1;
      setSearch({ group: g, progress: k, evaluated: Math.round(rec.evaluated * k) });
      if (k >= 1) break;
      await sleep(30);
    }
    setSearch(null);
    setRecRun((r) => ({ ...r, [g]: true }));
    await animateTo(g, rec, 900);
  }, [allowed]);

  // ── 3. 스케줄 ──
  const runSchedule = useCallback(async () => {
    const total = opt.evaluated, ms = reduced() ? 0 : 1000, t0 = performance.now();
    while (true) {
      const k = ms ? Math.min(1, (performance.now() - t0) / ms) : 1;
      setSchedAnim(Math.round(total * k));
      if (k >= 1) break;
      await sleep(30);
    }
    setSchedAnim(null);
    setSchedRun(true);
  }, [opt.evaluated]);

  // ── 전체 실행 ──
  const runAll = async () => {
    setFull({ running: true, stage: 0, done: false });
    go("compat"); await sleep(reduced() ? 0 : 500);
    await runCompat();
    setFull((f) => ({ ...f, stage: 1 }));
    go("mpw"); await sleep(reduced() ? 0 : 500);
    for (const g of ["P1", "P2"]) {
      if (valid.some((o) => o.group === g)) { setGroup(g); await runPlace(g); await sleep(reduced() ? 0 : 1200); }
    }
    setGroup("P1");
    setFull((f) => ({ ...f, stage: 2 }));
    go("recipe"); await sleep(reduced() ? 0 : 600);
    setGroup("P1"); await runRecipe("P1");
    await sleep(300);
    if (valid.some((o) => o.group === "P2")) { setGroup("P2"); await runRecipe("P2"); await sleep(300); setGroup("P1"); }
    setFull((f) => ({ ...f, stage: 3 }));
    go("schedule"); await sleep(reduced() ? 0 : 600);
    await runSchedule();
    await sleep(500);
    setFull({ running: false, stage: 4, done: true });
    go("impact");
  };

  const addOrder = () => {
    if (orders.length >= 8) return;
    const id = [..."ABCDEFGH"].find((l) => !orders.some((o) => o.id === l));
    setOrders((os) => [...os, { id, company: id + "사", chip: "신규 칩", w: 2, h: 2, qty: 30, platform: "CMOS", material: "POLY", due: 14 }]);
    setBaseSeq((s) => [...s, id]);
  };
  const removeOrder = (id) => {
    if (orders.length <= 2) return;
    setOrders((os) => os.filter((o) => o.id !== id));
    setBaseSeq((s) => s.filter((x) => x !== id));
  };

  const resetAll = () => {
    setOrders(INIT_ORDERS); setCompat({ status: "idle", step: -1, scanning: null }); setCur(baseCur()); setAllowed(baseAllowed());
    setRecRun({ P1: false, P2: false }); setBaseSeq(INIT_BASE_SEQ); setSch(INIT_SCH); setSchedRun(false); setCost(INIT_COST);
    setFull({ running: false, stage: -1, done: false }); setGroup("P1");
    setPlace({ P1: null, P2: null }); setMp(mpwInit());
  };

  const props = { addOrder, removeOrder, orders: valid, allOrders, held, compatDone, setOrders, compat, groups, group, setGroup, cur, setCur, allowed, setAllowed, recs, recRun, search, busy,
    runCompat, runRecipe, place, runPlace, applySugg, placeBusy, mp, setMp, mpwRes, baseSeq: baseSeqEff, setBaseSeq, sch, setSch, baseSim, opt, schedRun, schedAnim, runSchedule, cost, setCost, full, runAll, go };

  // 가로 스크롤 메뉴·진행 표시에서 현재 항목이 보이도록 (가로 방향만 스크롤, 세로 위치는 건드리지 않음)
  const navRef = useRef(null), pipeRef = useRef(null);
  const centerIn = (box, el) => {
    if (!box || !el || box.scrollWidth <= box.clientWidth + 1) return;
    const left = el.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft - (box.clientWidth - el.offsetWidth) / 2;
    box.scrollTo({ left: Math.max(0, left), behavior: reduced() ? "auto" : "smooth" });
  };
  useEffect(() => { const n = navRef.current; centerIn(n, n && n.querySelector(".nav-item.on")); }, [active]);
  useEffect(() => { const p = pipeRef.current; centerIn(p, p && (p.querySelector(".pipe.run") || [...p.querySelectorAll(".pipe.done")].pop())); }, [full.stage, full.done]);

  const idx = NAV.findIndex(([id]) => id === active);
  const navStatus = {
    compat: compat.status === "done" ? "done" : compat.status === "running" ? "run" : null,
    mpw: placeBusy ? "run" : (mpwRes.P1.done || mpwRes.P2.done) ? "done" : null,
    recipe: search ? "run" : recRun.P1 ? "done" : null,
    yield: recRun.P1 ? "done" : null,
    schedule: schedAnim != null ? "run" : schedRun ? "done" : null,
    impact: recRun.P1 && schedRun ? "done" : null,
  };

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <Wafer />
          <div>
            <div className="brand-name">MPW NEXUS <b>AI</b></div>
            <div className="brand-sub">FabShare · MPW 공정 최적화 시뮬레이터</div>
          </div>
        </div>
        <nav aria-label="섹션 메뉴" ref={navRef}>
          {NAV.map(([id, en, ko], i) => (
            <button key={id} className={"nav-item" + (active === id ? " on" : "")} onClick={() => go(id)} aria-current={active === id ? "page" : undefined} title={`${String(i + 1).padStart(2, "0")} ${en} · ${ko}`}>
              <span className="nav-i">{String(i + 1).padStart(2, "0")}</span>
              <span className="nav-txt"><span className="nav-en">{en}</span><span className="nav-ko">{ko}</span></span>
              {navStatus[id] && <span className={"nav-st " + navStatus[id]} title={navStatus[id] === "done" ? "완료" : "진행 중"} />}
            </button>
          ))}
        </nav>
        <div className="side-note">
          교육·발표용 시뮬레이터입니다. 실제 장비와 연결되지 않으며, 모든 수치는 가상 공정 모델로 계산합니다.
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="pipeline" ref={pipeRef}>
            {["호환성 분석", "MPW AI 배치", "레시피 최적화", "스케줄 최적화", "결과 리포트"].map((s, i) => (
              <div key={s} className={"pipe" + (full.stage > i || full.done ? " done" : full.stage === i && full.running ? " run" : "")}>
                <span className="pipe-dot" />{s}
              </div>
            ))}
          </div>
          <div className="top-actions">
            <button className="btn ghost" onClick={resetAll} disabled={busy}>초기화</button>
            <button className="btn primary big" onClick={runAll} disabled={busy}>
              {full.running ? <><span className="spin" /> 최적화 진행 중…</> : "전체 AI 최적화 실행"}
            </button>
          </div>
        </div>

        <div className="disclaimer">
          <b>시뮬레이션 안내</b> 이 화면의 “AI”는 정의된 가상 수율 모델과 생산 스케줄 모델 위에서 최적 조건을 전수 탐색하는 최적화 알고리즘입니다.
          실제 제조 데이터로 학습·검증한 머신러닝 모델이 아니며, 표시되는 수율은 실측값이 아닌 모델 계산값입니다.
        </div>

        <div className="view" key={active}>
          {active === "overview" && <Overview {...props} orders={allOrders} />}
          {active === "compat" && <Compat {...props} />}
          {active === "mpw" && <MpwPlace {...props} />}
          {active === "recipe" && <Recipe {...props} />}
          {active === "yield" && <YieldSim {...props} />}
          {active === "schedule" && <Scheduler {...props} />}
          {active === "impact" && <Impact {...props} />}
        </div>
        <div className="pager">
          {idx > 0 ? <button className="btn ghost" onClick={() => go(NAV[idx - 1][0])}>‹ {NAV[idx - 1][2]}</button> : <span />}
          {idx < NAV.length - 1 && <button className="btn ghost" onClick={() => go(NAV[idx + 1][0])}>{NAV[idx + 1][2]} ›</button>}
        </div>
        <footer className="foot">MPW NEXUS AI × FabShare · AX Challenge 시연용 · 초기 주문 데이터는 예시이며, MPW 가격은 Europractice 2026 공시가 기준입니다.</footer>
      </main>
    </div>
  );
}

function Wafer() {
  return (
    <svg viewBox="0 0 40 40" className="wafer" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="var(--cyan)" strokeWidth="2" />
      <path d="M12 35 h16" stroke="var(--cyan)" strokeWidth="2" />
      {[[11, 11], [20, 11], [29, 11], [11, 20], [20, 20], [29, 20], [11, 29], [20, 29], [29, 29]].map(([x, y], i) => (
        <rect key={i} x={x - 3.4} y={y - 3.4} width="6.8" height="6.8" rx="1" style={{ fill: i === 4 ? "var(--cyan)" : ["var(--chipA)","var(--chipB)","var(--chipC)","var(--chipD)","","var(--chipE)","var(--chipA)","var(--chipC)","var(--chipB)"][i] }} />
      ))}
    </svg>
  );
}

// ───────────────────────── 1. Overview ─────────────────────────
function Overview({ orders, setOrders, busy, addOrder, removeOrder, compatDone, groups, go }) {
  const tot = orders.reduce((s, o) => s + o.qty, 0);
  const area = orders.reduce((s, o) => s + o.w * o.h, 0);
  const upd = (id, k, v) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, [k]: v } : o)));
  const numIn = (o, k, min, max, step = 1) => (
    <input id={`o-${o.id}-${k}`} type="number" className="cell-in" value={o[k]} min={min} max={max} step={step} disabled={busy}
      onChange={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) upd(o.id, k, Math.min(max, Math.max(min, v))); }} />
  );
  return (
    <Section id="overview" idx="01" kicker="Overview" title="전체 주문 현황">
      <div className="kpis">
        <div className="kpi"><div className="kpi-l">고객 주문</div><div className="kpi-v"><Num v={orders.length} d={0} /><small>건</small></div></div>
        <div className="kpi"><div className="kpi-l">생산 대상 칩</div><div className="kpi-v"><Num v={tot} locale /><small>개</small></div></div>
        <div className="kpi"><div className="kpi-l">다이 면적 합계</div><div className="kpi-v"><Num v={area} d={0} /><small>mm²</small></div></div>
        <div className="kpi"><div className="kpi-l">공정 그룹</div><div className="kpi-v">{compatDone ? <><Num v={groups.length} d={0} /><small>개</small></> : <span className="kpi-wait">분석 전</span>}</div></div>
        <div className="kpi"><div className="kpi-l">최단 납기</div><div className="kpi-v"><Num v={Math.min(...orders.map((o) => o.due))} d={0} /><small>일</small></div></div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>MPW 주문 목록</h3>
          <div className="count-ctl" aria-label="회사 수 조절">
            <span>회사 수</span>
            <button className="btn tiny ghost" onClick={() => removeOrder(orders[orders.length - 1].id)} disabled={busy || orders.length <= 2} aria-label="마지막 회사 삭제">−</button>
            <b className="mono">{orders.length}</b>
            <button className="btn tiny ghost" onClick={addOrder} disabled={busy || orders.length >= 8} aria-label="회사 추가">+</button>
            <small>2~8개</small>
          </div>
          <span className="hint">공정 그룹은 여기서 정하지 않습니다. 고객이 요청한 플랫폼·식각 대상을 입력하면 2단계 공정 호환성 분석에서 그룹을 판정합니다.</span>
        </div>
        <div className="scroll-x">
          <table className="tbl order-tbl">
            <thead>
              <tr><th>회사</th><th>칩 종류</th><th>크기 (mm)</th><th className="r">다이 면적</th><th>주문 수량</th><th>기본 플랫폼</th><th>식각 대상</th><th>납기 (일)</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="c-co" data-label="회사"><span className="co-cell"><span className="co-badge neutral" style={{ background: `var(--chip${o.id})`, color: "#fff", borderColor: "transparent" }}>{o.id}</span>
                    <input id={`o-${o.id}-company`} className="cell-in txt sm" value={o.company} maxLength={12} disabled={busy} aria-label="회사 이름"
                      onChange={(e) => upd(o.id, "company", e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) upd(o.id, "company", o.id + "사"); }} /></span></td>
                  <td className="c-chip" data-label="칩 종류"><input id={`o-${o.id}-chip`} className="cell-in txt" value={o.chip} maxLength={30} disabled={busy} aria-label="칩 종류"
                    onChange={(e) => upd(o.id, "chip", e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) upd(o.id, "chip", "칩"); }} /></td>
                  <td className="c-size" data-label="크기 (mm)"><span className="size">{numIn(o, "w", 0.5, 10, 0.1)}<span>×</span>{numIn(o, "h", 0.5, 10, 0.1)}</span></td>
                  <td className="r mono c-area" data-label="다이 면적">{(o.w * o.h).toFixed(1)} mm²</td>
                  <td className="c-qty" data-label="주문 수량">{numIn(o, "qty", 1, 100, 1)}</td>
                  <td className="c-plat" data-label="기본 플랫폼">
                    <select id={`o-${o.id}-platform`} className="cell-in sel" value={o.platform} disabled={busy} onChange={(e) => upd(o.id, "platform", e.target.value)}>
                      {PLATFORMS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                    </select>
                  </td>
                  <td className="c-mat" data-label="식각 대상">
                    <select id={`o-${o.id}-material`} className="cell-in sel" value={o.material} disabled={busy} onChange={(e) => upd(o.id, "material", e.target.value)}>
                      {MATERIALS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                    </select>
                  </td>
                  <td className="c-due" data-label="납기 (일)">{numIn(o, "due", 1, 60)}</td>
                  <td className="c-del"><button className="row-del" onClick={() => removeOrder(o.id)} disabled={busy || orders.length <= 2} aria-label={`${o.company} 삭제`} title="삭제">삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row-actions">
          <button className="btn ghost add-row" onClick={addOrder} disabled={busy || orders.length >= 8}>+ 회사 추가</button>
          <button className="btn ghost del-row" onClick={() => removeOrder(orders[orders.length - 1].id)} disabled={busy || orders.length <= 2}>− 회사 줄이기 ({orders[orders.length - 1].company} 삭제)</button>
          <span className="hint">각 행 오른쪽의 [삭제] 버튼으로 원하는 회사를 바로 지울 수도 있습니다. 회사는 2~8개까지 둘 수 있습니다.</span>
        </div>
      </div>
      <div className="panel next-step">
        <p>다음 단계: 주문별 플랫폼·식각 대상을 비교해 같은 MPW 런에서 함께 생산할 수 있는 주문끼리 공정 그룹을 나눕니다.</p>
        <button className="btn primary" onClick={() => go("compat")}>공정 호환성 분류로 이동 ›</button>
      </div>
    </Section>
  );
}

// ───────────────────────── 2. Compatibility ─────────────────────────
function Compat({ allOrders: orders, held, compat, groups, runCompat, busy }) {
  const box = useRef(null);
  const done = compat.status === "done";
  const reg = useFlip(box, done ? "grouped:" + groups.map((g) => g.gid + g.list.map((o) => o.id).join("")).join("|") : "queue");
  const card = (o) => (
    <div key={o.id} ref={reg(o.id)} className={"ocard " + (done ? o.group : "") + (compat.scanning === o.id ? " scanning" : "")}>
      <div className="ocard-top"><span className={"co-badge " + (done ? o.group : "neutral")}>{o.id}</span><b>{o.company}</b>
        {done && o.group && <span className={"tag sm " + o.group}>{o.group} 그룹</span>}</div>
      <div className="ocard-chip">{o.chip}</div>
      <div className="ocard-meta mono">{o.w}×{o.h} mm · {o.qty}개 · D-{o.due}</div>
      <div className="ocard-proc">{labelOf(PLATFORMS, o.platform)} · {labelOf(MATERIALS, o.material)}</div>
    </div>
  );
  return (
    <Section id="compat" idx="02" kicker="Compatibility AI" title="공정 호환성 자동 분류"
      actions={<button className="btn primary" onClick={runCompat} disabled={busy}>{compat.status === "running" ? <><span className="spin" /> 분석 중…</> : "AI 공정 호환성 분석"}</button>}>
      <div className="compat-grid">
        <div className="panel steps">
          <h3>판정 단계</h3>
          <ol>
            {COMPAT_STEPS.map((s, i) => (
              <li key={s} className={compat.step > i || done ? "done" : compat.step === i ? "run" : ""}>
                <span className="st-dot">{compat.step > i || done ? "✓" : i + 1}</span>{s}
              </li>
            ))}
          </ol>
          <Progress value={done ? 1 : Math.max(0, compat.step) / COMPAT_STEPS.length} />
          <p className="hint">판정 기준: 기본 공정 플랫폼, 식각 대상 재료, 장비·레시피 허용 범위가 모두 일치해야 같은 MPW 런으로 묶습니다.
            플랫폼이 다르면 식각 압력·시간을 조정해도 통합할 수 없습니다.</p>
        </div>
        <div className="lanes" ref={box}>
          {!done ? (
            <div className="lane queue">
              <div className="lane-h">미분류 주문 대기열</div>
              <div className="lane-cards">{orders.map(card)}</div>
            </div>
          ) : (
            [...groups.map((g, i) => (
              <div key={g.gid} className={"lane " + g.gid}>
                <div className="lane-h">
                  <span className={"tag " + g.gid}>{g.gid} 그룹</span>
                  {i === 0 ? (g.list.length > 1 ? "공동 MPW 생산 가능" : "단독 MPW 런") : `별도 MPW 런 필요 · ${groups[0].gid} 그룹과 통합 불가`}
                  <span className="lane-meta mono">{g.list.length}건 · {g.qty.toLocaleString()}개 · 레티클 {(g.util * 100).toFixed(1)}%</span>
                </div>
                <div className="lane-cards">{g.list.map(card)}</div>
              </div>
            )), held.length > 0 && (
              <div key="held" className="lane held">
                <div className="lane-h"><span className="tag bad">배정 보류</span>표준 공정 그룹과 맞지 않음<span className="lane-meta mono">{held.length}건</span></div>
                <div className="lane-cards">{held.map(card)}</div>
              </div>
            )]
          )}
        </div>
      </div>
      {done && (
        <div className="panel result fade-in">
          <div className="result-h"><span className="ok-dot" />AI 분석 완료</div>
          <ul className="result-list">
            {groups.map((g, i) => (
              <li key={g.gid}>
                <span className={"tag " + g.gid}>{g.gid} 그룹</span>
                <b>{g.list.map((o) => o.company).join(" + ")}</b> → {i === 0 ? (g.list.length > 1 ? "공동 MPW 생산 가능" : "단독 MPW 런") : "별도 MPW 생산 필요"}
                <span className="muted"> · 플랫폼·식각 재료·허용 범위 일치</span>
                {g.area > RETICLE_MM2 && <span className="warn-inline">레티클 면적 초과({g.area.toFixed(0)} mm² &gt; {RETICLE_MM2} mm²): 셔틀 분할 필요</span>}
              </li>
            ))}
            {groups.length > 1 && (
              <li><span className="tag neutral">P1 그룹 ↔ P2 그룹</span>기본 플랫폼과 식각 대상 재료가 달라 같은 MPW 런으로 통합할 수 없습니다. 각 그룹을 별도 생산 런으로 분리했습니다.</li>
            )}
            {held.length > 0 && (
              <li className="warn"><span className="tag bad">배정 보류</span><b>{held.map((o) => o.company).join(", ")}</b> → 플랫폼과 식각 대상 조합이 정의된 공정 그룹과 맞지 않아 MPW 런 배정에서 제외했습니다. 레시피·스케줄 계산에도 포함되지 않습니다.</li>
            )}
            <li><span className="tag neutral">효과</span>호환 가능한 주문만 묶어 한 런 안에서 공정 조건이 충돌하지 않도록 했습니다.</li>
          </ul>
        </div>
      )}
      <h3 className="mt">판정 기준 · 표준 공정 그룹 정의</h3>
      <div className="grp-defs">
        {Object.values(GROUPS).map((g) => (
          <div key={g.id} className={"grp-def " + g.id}>
            <div className="grp-def-h"><span className={"tag " + g.id}>{g.id} 그룹</span>{g.name.split("· ")[1]}</div>
            <dl>
              <dt>기본 플랫폼</dt><dd>{g.platform}</dd>
              <dt>식각 대상</dt><dd>{g.material}</dd>
              <dt>장비·화학계</dt><dd>{g.tool}</dd>
              <dt>허용 레시피 범위</dt><dd className="mono">{g.allowed.pMin}–{g.allowed.pMax} mTorr · {g.allowed.tMin}–{g.allowed.tMax} s</dd>
            </dl>
          </div>
        ))}
      </div>
    </Section>
  );
}

function NeedCompat({ go, what }) {
  return (
    <div className="panel need">
      <p><b>공정 호환성 분석이 먼저 필요합니다.</b> 주문을 공정 그룹으로 나눈 뒤에 {what}을 실행할 수 있습니다.</p>
      <button className="btn primary" onClick={() => go("compat")}>공정 호환성 분류로 이동 ›</button>
    </div>
  );
}

// ───────────────────────── 3. Recipe ─────────────────────────
function GroupTabs({ group, setGroup, busy, orders, compatDone }) {
  return (
    <div className="tabs" role="tablist">
      {["P1", "P2"].map((g) => {
        const n = orders.filter((o) => o.group === g).length;
        return (
          <button key={g} role="tab" aria-selected={group === g} className={"tab " + g + (group === g ? " on" : "")} disabled={busy} onClick={() => setGroup(g)}>
            {GROUPS[g].name}{compatDone && <span className="tab-n">{n}건</span>}
          </button>
        );
      })}
    </div>
  );
}

function Slider({ id, label, unit, value, min, max, lo, hi, onChange, disabled }) {
  const pct = (v) => ((v - min) / (max - min)) * 100;
  const bg = `linear-gradient(to right, var(--track) 0%, var(--track) ${pct(lo)}%, var(--accent-soft) ${pct(lo)}%, var(--accent-soft) ${pct(hi)}%, var(--track) ${pct(hi)}%, var(--track) 100%)`;
  const out = value < lo || value > hi;
  return (
    <div className="slider">
      <div className="slider-h">
        <label htmlFor={id}>{label}</label>
        <span className={"slider-v mono" + (out ? " out" : "")}>{value.toFixed(1)} <small>{unit}</small></span>
      </div>
      <input id={id} type="range" min={min} max={max} step={0.5} value={value} disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))} style={{ background: bg }} />
      <div className="slider-scale mono"><span>{min}</span><span className="allowed-l">허용 {lo}–{hi}</span><span>{max}</span></div>
    </div>
  );
}

function Controls({ group, cur, setCur, allowed, busy, compact }) {
  const c = cur[group], al = allowed[group];
  const set = (k) => (v) => setCur((x) => ({ ...x, [group]: { ...x[group], [k]: v } }));
  return (
    <div className={"controls" + (compact ? " compact" : "")}>
      <Slider id={`${compact ? "y" : "r"}-p`} label="식각 압력" unit="mTorr" value={c.P} min={SLIDER.pMin} max={SLIDER.pMax} lo={al.pMin} hi={al.pMax} onChange={set("P")} disabled={busy} />
      <Slider id={`${compact ? "y" : "r"}-t`} label="식각 시간" unit="s" value={c.t} min={SLIDER.tMin} max={SLIDER.tMax} lo={al.tMin} hi={al.tMax} onChange={set("t")} disabled={busy} />
    </div>
  );
}

function Recipe(p) {
  const { group, setGroup, cur, setCur, allowed, setAllowed, recs, recRun, search, busy, runRecipe, orders, compatDone, go } = p;
  const g = GROUPS[group], c = cur[group], al = allowed[group];
  const y = yieldOf(group, c.P, c.t);
  const by = yieldOf(group, g.baseline.P, g.baseline.t);
  const rec = recs[group];
  const out = !inAllowed(al, c.P, c.t);
  const m = g.model;
  const lossP = m.Ymax - yieldOf(group, g.baseline.P, m.t0), lossT = m.Ymax - yieldOf(group, m.P0, g.baseline.t);
  const setAl = (k, v) => setAllowed((a) => {
    const n = { ...a[group], [k]: v };
    if (n.pMin >= n.pMax || n.tMin >= n.tMax) return a;
    return { ...a, [group]: n };
  });
  const searching = search && search.group === group;
  return (
    <Section id="recipe" idx="04" kicker="Recipe Optimizer" title="AI 식각 레시피 최적화"
      actions={<GroupTabs group={group} setGroup={setGroup} busy={busy} orders={orders} compatDone={p.compatDone} />}>
      {!compatDone && <NeedCompat go={go} what="AI 레시피 추천" />}
      <div className="recipe-grid">
        <div className="panel yield-panel">
          <div className="yield-big">
            <div className="yb-l">현재 조건 예상 수율 <span className="model-tag">가상 모델 계산값</span></div>
            <div className={"yb-v" + (y >= rec.y - 0.05 ? " good" : y < by ? " bad" : "")}><Num v={y} d={1} ms={220} /><small>%</small></div>
            <div className="yb-deltas">
              <span>기존 대비 <b className={y - by >= 0 ? "pos" : "neg"}><Num v={y - by} d={1} sign ms={220} />%p</b></span>
              <span>상대 변화 <b className={y - by >= 0 ? "pos" : "neg"}><Num v={((y - by) / by) * 100} d={1} sign ms={220} />%</b></span>
              <span>시간 변화 <b className={c.t - g.baseline.t <= 0 ? "pos" : "neg"}>{c.t - g.baseline.t > 0 ? "+" : ""}{(c.t - g.baseline.t).toFixed(1)}초</b></span>
            </div>
            {out && <div className="warn-box">현재 조건이 {group} 그룹의 허용 범위를 벗어났습니다. 모델 계산값은 참고용이며 AI 추천 후보에서는 제외됩니다.</div>}
          </div>
          <Controls group={group} cur={cur} setCur={setCur} allowed={allowed} busy={busy} />
          <div className="btn-row">
            <button className="btn primary" onClick={() => runRecipe(group)} disabled={busy || !compatDone} title={compatDone ? "" : "공정 호환성 분석을 먼저 실행하세요"}>
              {searching ? <><span className="spin" /> 조건 탐색 중…</> : "AI 최적 레시피 추천"}
            </button>
            <button className="btn ghost" onClick={() => setCur((x) => ({ ...x, [group]: { ...g.baseline } }))} disabled={busy}>기존 조건 복원</button>
          </div>
          {searching && <Progress value={search.progress} label={`${search.evaluated.toLocaleString()} / ${rec.evaluated.toLocaleString()} 조합 평가`} />}
        </div>

        <div className="recipe-side">
          <div className="cmp2">
            <div className="cmp-card base">
              <div className="cmp-h">기존 공정 조건</div>
              <div className="cmp-row"><span>식각 압력</span><b className="mono">{g.baseline.P} mTorr</b></div>
              <div className="cmp-row"><span>식각 시간</span><b className="mono">{g.baseline.t} s</b></div>
              <div className="cmp-row big"><span>예상 수율</span><b className="mono">{by.toFixed(1)}%</b></div>
            </div>
            <div className={"cmp-card ai" + (recRun[group] ? "" : " pending")}>
              <div className="cmp-h">AI 추천 조건</div>
              {recRun[group] ? (
                <>
                  <div className="cmp-row"><span>식각 압력</span><b className="mono"><Num v={rec.P} d={1} /> mTorr</b></div>
                  <div className="cmp-row"><span>식각 시간</span><b className="mono"><Num v={rec.t} d={1} /> s</b></div>
                  <div className="cmp-row big"><span>예상 수율</span><b className="mono"><Num v={rec.y} d={1} />%</b></div>
                </>
              ) : <div className="cmp-empty">[AI 최적 레시피 추천]을 누르면 허용 범위 안에서 최적 조건을 탐색합니다.</div>}
            </div>
          </div>

          {recRun[group] && (
            <div className="panel fade-in">
              <div className="gain-row">
                <div className="gain"><div className="gain-v"><Num v={rec.y - by} d={1} sign />%p</div><div className="gain-l">예상 수율 개선 (절대)</div></div>
                <div className="gain"><div className="gain-v"><Num v={((rec.y - by) / by) * 100} d={1} sign />%</div><div className="gain-l">기존 대비 상대 향상률</div></div>
                <div className="gain"><div className="gain-v"><Num v={g.baseline.t - rec.t} d={1} />초</div><div className="gain-l">식각 시간 단축 ({(((g.baseline.t - rec.t) / g.baseline.t) * 100).toFixed(1)}%)</div></div>
              </div>
              <p className="ai-msg">
                <b>분석 메시지 · </b>
                시뮬레이션 모델에서 {rec.evaluated.toLocaleString()}개 조합을 평가했고, 허용 범위 밖 {rec.excluded.toLocaleString()}개는 후보에서 제외했습니다.
                식각 압력 {rec.P} mTorr, 공정 시간 {rec.t}초 부근의 예상 수율이 {rec.y.toFixed(1)}%로 가장 높았습니다.
                {rec.bounded
                  ? ` 모델상 최고점(${rec.unconstrained.P} mTorr, ${rec.unconstrained.t}초)이 허용 범위 밖이므로 허용 범위 경계의 조건을 선택했습니다.`
                  : ` 동일 공정 그룹(${group} 그룹)의 허용 범위 안에서 공통 레시피로 선정했습니다.`}
                {" "}기존 조건의 수율 손실은 {(m.Ymax - by).toFixed(1)}%p입니다. 압력만 기존값이면 {lossP.toFixed(1)}%p, 시간만 기존값이면 {lossT.toFixed(1)}%p가 줄어듭니다.
              </p>
              <p className="hint">“{fmt(rec.y - by)}%p”는 수율의 절대 증가폭이고, “{fmt(((rec.y - by) / by) * 100)}%”는 기존 수율 {by.toFixed(1)}% 대비 상대 향상률입니다.</p>
            </div>
          )}

          <div className="panel">
            <div className="panel-head"><h3>{group} 그룹 허용 레시피 범위</h3><button className="btn tiny ghost" disabled={busy} onClick={() => setAllowed((a) => ({ ...a, [group]: { ...GROUPS[group].allowed } }))}>기본값</button></div>
            <div className="al-grid">
              {[["pMin", "압력 하한", "mTorr"], ["pMax", "압력 상한", "mTorr"], ["tMin", "시간 하한", "s"], ["tMax", "시간 상한", "s"]].map(([k, l, u]) => (
                <label key={k} className="al-f">
                  <span>{l}</span>
                  <span className="al-in"><input id={`al-${group}-${k}`} type="number" step="1" value={al[k]} disabled={busy}
                    min={k[0] === "p" ? SLIDER.pMin : SLIDER.tMin} max={k[0] === "p" ? SLIDER.pMax : SLIDER.tMax}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) setAl(k, v); }} /><small>{u}</small></span>
                </label>
              ))}
            </div>
            <p className="hint">장비·레시피 승인 범위를 좁히면 AI 추천이 그 범위 안에서 다시 탐색됩니다. 예: 압력 하한을 50으로 올려 보세요.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ───────────────────────── 4. Yield Simulator ─────────────────────────
function YieldSim(p) {
  const { group, setGroup, cur, setCur, allowed, recs, recRun, search, busy, orders } = p;
  const c = cur[group];
  const y = yieldOf(group, c.P, c.t);
  const rec = recs[group];
  const pick = (P, t) => { if (!busy) setCur((x) => ({ ...x, [group]: { P, t } })); };
  return (
    <Section id="yield" idx="05" kicker="Yield Simulator" title="압력·시간에 따른 예상 수율"
      actions={<GroupTabs group={group} setGroup={setGroup} busy={busy} orders={orders} compatDone={p.compatDone} />}>
      <div className="ysim-bar panel">
        <Controls group={group} cur={cur} setCur={setCur} allowed={allowed} busy={busy} compact />
        <div className="ysim-now"><span>현재 예상 수율</span><b className="mono"><Num v={y} d={1} ms={200} />%</b></div>
      </div>
      <div className="yield-grid">
        <div className="panel heat">
          <div className="panel-head">
            <h3>C · 압력 × 시간 수율 히트맵</h3>
            <span className="hint">히트맵을 클릭하거나 드래그하면 조건이 바뀝니다.</span>
          </div>
          <Heatmap group={group} P={c.P} t={c.t} allowed={allowed[group]} rec={rec} showRec={recRun[group]} onPick={pick}
            scan={search && search.group === group ? search.progress : null} />
          <div className="legend">
            <span className="mono">낮음</span>
            <div className="legend-bar" style={{ background: `linear-gradient(to right, ${LEGEND_STOPS.map((s) => s.c).join(",")})` }} />
            <span className="mono">높음</span>
            <span className="lg-i"><i className="dot red" />기존</span>
            <span className="lg-i"><i className="dot green" />AI 추천</span>
            <span className="lg-i"><i className="dot ring" />현재</span>
            <span className="lg-i"><i className="hatch" />허용 범위 밖</span>
          </div>
        </div>
        <div className="curves">
          <div className="panel">
            <div className="panel-head"><h3>A · 식각 압력에 따른 예상 수율</h3><span className="hint mono">시간 {c.t.toFixed(1)}s 고정</span></div>
            <CurveChart group={group} axis="P" P={c.P} t={c.t} allowed={allowed[group]} rec={rec} showRec={recRun[group]} />
          </div>
          <div className="panel">
            <div className="panel-head"><h3>B · 식각 시간에 따른 예상 수율</h3><span className="hint mono">압력 {c.P.toFixed(1)} mTorr 고정</span></div>
            <CurveChart group={group} axis="t" P={c.P} t={c.t} allowed={allowed[group]} rec={rec} showRec={recRun[group]} />
          </div>
          <p className="hint">A는 식각 시간을, B는 식각 압력을 현재 슬라이더 값으로 고정한 단면입니다. 흰 점(현재)·빨간 점(기존 조건 위치)·초록 점(AI 추천 위치)은 모두 이 곡선 위의 값이라,
            슬라이더를 움직이면 곡선과 점이 함께 움직입니다. 기존 조건의 실제 수율(두 값 모두 기존일 때)과 AI 추천 수율은 히트맵의 빨간 점·초록 점에서 확인할 수 있습니다. 청록 음영은 그룹 허용 범위입니다.</p>
        </div>
      </div>
    </Section>
  );
}

// ───────────────────────── 5. Scheduler ─────────────────────────
function Scheduler(p) {
  const { orders, baseSeq, setBaseSeq, sch, setSch, baseSim, opt, schedRun, schedAnim, runSchedule, busy, compatDone, go } = p;
  const best = opt.best;
  const maxH = Math.max(baseSim.makespan, best.makespan, ...orders.map((o) => o.due * 24)) + 12;
  // 화면의 순서(보류 주문 제외)에서 이웃한 두 주문의 자리를 전체 목록 안에서 맞바꿈
  const move = (i, d) => {
    const a = baseSeq[i], b = baseSeq[i + d];
    if (!a || !b) return;
    setBaseSeq((s) => { const n = s.slice(); const ia = n.indexOf(a), ib = n.indexOf(b); [n[ia], n[ib]] = [n[ib], n[ia]]; return n; });
  };
  const name = (id) => orders.find((o) => o.id === id).company;
  const grp = (id) => orders.find((o) => o.id === id).group;
  const changeOnlyLate = opt.changeOnly.tardy > 1e-9 && best.seq.join() !== opt.changeOnly.seq.join();
  const setS = (k, v, min, max) => { if (Number.isFinite(v)) setSch((s) => ({ ...s, [k]: Math.min(max, Math.max(min, v)) })); };
  const SeqChips = ({ seq, editable }) => (
    <div className="seq">
      {seq.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && <span className={"seq-arrow" + (grp(seq[i - 1]) !== grp(id) ? " switch" : "")}>{grp(seq[i - 1]) !== grp(id) ? "⇄" : "→"}</span>}
          <span className={"seq-chip " + grp(id)}>
            {editable && <button aria-label={`${name(id)} 앞으로`} disabled={busy || i === 0} onClick={() => move(i, -1)}>‹</button>}
            {name(id)}
            {editable && <button aria-label={`${name(id)} 뒤로`} disabled={busy || i === seq.length - 1} onClick={() => move(i, 1)}>›</button>}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
  const pct = baseSim.changeMin > 0 ? ((baseSim.changeMin - best.changeMin) / baseSim.changeMin) * 100 : 0;
  return (
    <Section id="schedule" idx="06" kicker="Production Scheduler" title="AI 생산 런 순서 최적화"
      actions={<button className="btn primary" onClick={runSchedule} disabled={busy || !compatDone}>{schedAnim != null ? <><span className="spin" /> 순서 탐색 중…</> : "AI 생산 스케줄 최적화"}</button>}>
      {!compatDone ? <NeedCompat go={go} what="생산 스케줄 최적화" /> : <>
      <p className="lead">각 막대는 고객사별 생산 배치(런) 단위입니다. 같은 MPW 셔틀에 묶인 칩은 웨이퍼 공정을 공유하므로 개별 순서가 없고,
        이 화면은 셔틀·배치 런을 장비에 투입하는 순서를 정하는 예시 모델입니다. 공정 그룹이 바뀔 때마다 장비 준비와 레시피 전환 시간이 발생합니다.</p>
      <div className="sched-top">
        <div className="panel">
          <h3>기존 생산 순서 <span className="hint">‹ › 로 순서를 바꿀 수 있습니다</span></h3>
          <SeqChips seq={baseSeq} editable />
          <h3 className="mt">AI 추천 순서</h3>
          {schedRun ? <SeqChips seq={best.seq} /> : <div className="cmp-empty">[AI 생산 스케줄 최적화]를 누르면 가능한 모든 순서({opt.evaluated.toLocaleString()}가지)를 평가합니다.</div>}
          {schedAnim != null && <Progress value={schedAnim / opt.evaluated} label={`${schedAnim.toLocaleString()} / ${opt.evaluated.toLocaleString()} 순서 평가`} />}
        </div>
        <div className="panel params">
          <h3>스케줄 모델 변수</h3>
          <label className="al-f"><span>그룹 전환 시간</span><span className="al-in"><input id="s-change" type="number" value={sch.changeMin} step="10" disabled={busy} onChange={(e) => setS("changeMin", parseFloat(e.target.value), 0, 1440)} /><small>분</small></span></label>
          <label className="al-f"><span>런 준비 시간</span><span className="al-in"><input id="s-setup" type="number" value={sch.setupH} step="0.1" disabled={busy} onChange={(e) => setS("setupH", parseFloat(e.target.value), 0, 100)} /><small>시간</small></span></label>
          <label className="al-f"><span>칩 100개당 처리</span><span className="al-in"><input id="s-chip" type="number" value={+(sch.perChipH * 100).toFixed(2)} step="1" disabled={busy} onChange={(e) => setS("perChipH", parseFloat(e.target.value) / 100, 0, 100)} /><small>시간</small></span></label>
          <p className="hint mono">런 소요 = 준비 {sch.setupH}h + 수량 × {(sch.perChipH * 60).toFixed(1)}분</p>
        </div>
      </div>

      {schedRun && (
        <div className="sched-stats fade-in">
          <div className="stat"><div className="stat-l">공정 그룹 전환</div><div className="stat-v"><span className="old">{baseSim.changes}회</span>→<Num v={best.changes} d={0} suffix="회" /></div></div>
          <div className="stat"><div className="stat-l">레시피 전환 소요</div><div className="stat-v"><span className="old">{baseSim.changeMin}분</span>→<Num v={best.changeMin} d={0} suffix="분" /></div></div>
          <div className="stat hl"><div className="stat-l">전환 시간 절감</div><div className="stat-v"><Num v={baseSim.changeMin - best.changeMin} d={0} suffix="분" /><small> ({pct.toFixed(0)}%)</small></div></div>
          <div className="stat"><div className="stat-l">전체 완료 시점</div><div className="stat-v"><span className="old">{(baseSim.makespan / 24).toFixed(2)}일</span>→<Num v={best.makespan / 24} d={2} suffix="일" /></div>
            <div className="stat-sub">−{((baseSim.makespan - best.makespan)).toFixed(1)}시간 ({(((baseSim.makespan - best.makespan) / baseSim.makespan) * 100).toFixed(1)}%)</div></div>
          <div className="stat"><div className="stat-l">납기 지연</div><div className="stat-v"><span className="old">{baseSim.lateIds.length}건</span>→<Num v={best.lateIds.length} d={0} suffix="건" /></div></div>
        </div>
      )}

      {schedRun && (() => {
        const procH = baseSim.makespan - baseSim.changeMin / 60;
        const W = Math.max(baseSim.makespan, best.makespan);
        const row = (label, sim, cls) => (
          <div className="tb-row">
            <span className="tb-l">{label}</span>
            <div className="tb-bar">
              <div className="tb-proc" style={{ width: `${(procH / W) * 100}%` }}><span>가공 {procH.toFixed(1)}h</span></div>
              <div className={"tb-chg " + cls} style={{ width: `${(sim.changeMin / 60 / W) * 100}%` }} />
            </div>
            <span className="tb-v mono">{(sim.makespan).toFixed(1)}h · 전환 {(sim.changeMin / 60).toFixed(1)}h</span>
          </div>
        );
        return (
          <div className="panel fade-in">
            <h3>전체 완료 시점이 조금만 줄어드는 이유</h3>
            <div className="tb">{row("기존", baseSim, "old")}{row("AI", best, "new")}</div>
            <p className="hint">
              전체 완료 시점 = 런 가공 시간 합계 {procH.toFixed(1)}시간(약 {(procH / 24).toFixed(1)}일) + 그룹 전환 시간. 가공 시간은 순서를 바꿔도 변하지 않고,
              전환 시간만 {baseSim.changeMin}분 → {best.changeMin}분으로 {baseSim.changeMin - best.changeMin}분({((baseSim.changeMin - best.changeMin) / 60).toFixed(1)}시간 = {((baseSim.changeMin - best.changeMin) / 1440).toFixed(2)}일) 줄어듭니다.
              그래서 전환 시간은 {pct.toFixed(0)}% 줄지만 전체 기간은 {(((baseSim.makespan - best.makespan) / baseSim.makespan) * 100).toFixed(1)}%만 줄어듭니다. 데이터 오류가 아니라 이 모델에서 전환 시간이 전체의 {((baseSim.changeMin / 60 / baseSim.makespan) * 100).toFixed(1)}%뿐이기 때문입니다.
              전환 시간이 더 큰 라인을 가정하려면 위의 그룹 전환 시간을 늘려 보세요.
            </p>
          </div>
        );
      })()}

      {schedRun && (
        <div className="panel fade-in">
          <ul className="result-list">
            <li><span className="tag neutral">탐색 기준</span>① 납기 지연 시간 최소 ② 그룹 전환 횟수 최소 ③ 납기 빠른 주문 우선(납기 역전 최소) ④ 평균 완료 시각 최소, 이 순서로 비교했습니다.</li>
            {best.lateIds.length > 0 && <li className="warn"><span className="tag bad">납기 경고</span>최적 순서에서도 {best.lateIds.map(name).join(", ")} 납기를 맞출 수 없습니다 (총 {best.tardy.toFixed(1)}시간 지연). 생산 능력 또는 납기 조정이 필요합니다.</li>}
            {baseSim.lateIds.length > 0 && <li className="warn"><span className="tag bad">기존 순서</span>{baseSim.lateIds.map(name).join(", ")} 납기 지연 ({baseSim.tardy.toFixed(1)}시간)</li>}
            {changeOnlyLate && <li className="warn"><span className="tag warnc">주의</span>전환 횟수만 최소화하면({opt.changeOnly.seq.map(name).join(" → ")}) {opt.changeOnly.lateIds.map(name).join(", ")} 납기가 {opt.changeOnly.tardy.toFixed(1)}시간 지연됩니다. 그래서 납기를 우선해 전환을 {best.changes}회로 두었습니다.</li>}
            {best.lateIds.length === 0 && <li><span className="tag ok">납기</span>모든 런이 납기 안에 완료됩니다. 가장 빠듯한 런은 {(() => { const r = best.blocks.filter((b) => b.type === "run").sort((a, b) => b.late - a.late)[0]; return `${name(r.id)} (여유 ${(-r.late / 24).toFixed(1)}일)`; })()}입니다.</li>}
          </ul>
        </div>
      )}

      <div className="panel">
        <Gantt sim={baseSim} orders={orders} maxH={maxH} title={`기존 순서 · 전환 ${baseSim.changes}회 · 완료 ${(baseSim.makespan / 24).toFixed(2)}일`} accent="#C2413B" />
        {schedRun && <Gantt sim={best} orders={orders} maxH={maxH} title={`AI 추천 순서 · 전환 ${best.changes}회 · 완료 ${(best.makespan / 24).toFixed(2)}일`} accent="#1C744B" />}
        <div className="legend">
          <span className="lg-i"><i className="sw p1" />P1 그룹 런</span><span className="lg-i"><i className="sw p2" />P2 그룹 런</span>
          <span className="lg-i"><i className="hatch red" />그룹 전환</span><span className="lg-i"><i className="due" />납기</span>
          <span className="lg-i"><i className="sw late" />납기 지연</span>
        </div>
      </div>
      </>}
    </Section>
  );
}

// ───────────────────────── 6. Impact ─────────────────────────
function Impact(p) {
  const { orders, recs, recRun, baseSim, opt, schedRun, cost, setCost, full, runAll, busy, mpwRes, mp } = p;
  const best = opt.best;
  const gs = ["P1", "P2"].map((g) => {
    const G = GROUPS[g], qty = orders.filter((o) => o.group === g).reduce((s, o) => s + o.qty, 0);
    const by = yieldOf(g, G.baseline.P, G.baseline.t), r = recs[g], run = recRun[g] && qty > 0;
    return { g, G, qty, by, r, run, dy: run ? r.y - by : 0, dt: run ? G.baseline.t - r.t : 0,
      good0: qty * by / 100, good1: run ? qty * r.y / 100 : qty * by / 100 };
  });
  const p1 = gs[0], p2 = gs[1];
  const goodGain = gs.reduce((s, x) => s + (x.good1 - x.good0), 0);
  const etchH = gs.reduce((s, x) => s + (x.run ? (x.dt * cost.wafers * cost.steps) / 3600 : 0), 0);
  const lineH = schedRun ? (baseSim.changeMin - best.changeMin) / 60 : 0;
  const ready = p1.run && schedRun;
  const setC = (k, v) => { if (Number.isFinite(v) && v >= 0) setCost((c) => ({ ...c, [k]: v })); };
  const ai = (v, ok) => (ok ? v : <span className="muted">미실행</span>);
  return (
    <Section id="impact" idx="07" kicker="AI Impact Report" title="기존 대비 개선 효과">
      <div className="impact-cards">
        <div className="icard hero">
          <div className="icard-l">P1 그룹 예상 수율 개선</div>
          <div className="icard-v">{p1.run ? <><Num v={p1.dy} d={1} sign ms={1200} /><small>%p</small></> : "—"}</div>
          <div className="icard-s">{p1.run ? <>{p1.by.toFixed(1)}% → {p1.r.y.toFixed(1)}% · 상대 향상률 <b>+{((p1.dy / p1.by) * 100).toFixed(1)}%</b></> : "레시피 추천 전"}</div>
        </div>
        <div className="icard hero p2">
          <div className="icard-l">P2 그룹 예상 수율 개선</div>
          <div className="icard-v">{p2.run ? <><Num v={p2.dy} d={1} sign ms={1200} /><small>%p</small></> : "—"}</div>
          <div className="icard-s">{p2.qty === 0 ? "P2 그룹 주문 없음" : p2.run ? <>{p2.by.toFixed(1)}% → {p2.r.y.toFixed(1)}% · 상대 향상률 <b>+{((p2.dy / p2.by) * 100).toFixed(1)}%</b></> : "레시피 추천 전"}</div>
        </div>
        <div className="icard">
          <div className="icard-l">식각 단계 시간 절감</div>
          <div className="icard-v">{p1.run ? <><Num v={(p1.dt / p1.G.baseline.t) * 100} d={1} ms={1200} /><small>%</small></> : "—"}</div>
          <div className="icard-s">{p1.run ? `P1 그룹 식각 1회당 ${p1.dt.toFixed(1)}초 (${p1.G.baseline.t}s → ${p1.r.t}s)` : "레시피 추천 전"}
            {p2.run && <><br />P2 그룹 {((p2.dt / p2.G.baseline.t) * 100).toFixed(1)}% · 1회당 {p2.dt.toFixed(1)}초 ({p2.G.baseline.t}s → {p2.r.t}s)</>}</div>
        </div>
        <div className="icard">
          <div className="icard-l">공정 그룹 전환 시간 절감</div>
          <div className="icard-v">{schedRun ? <><Num v={baseSim.changeMin ? ((baseSim.changeMin - best.changeMin) / baseSim.changeMin) * 100 : 0} d={0} ms={1200} /><small>%</small></> : "—"}</div>
          <div className="icard-s">{schedRun ? `${baseSim.changeMin}분 → ${best.changeMin}분 (−${baseSim.changeMin - best.changeMin}분)` : "스케줄 최적화 전"}</div>
        </div>
        <div className="icard">
          <div className="icard-l">MPW 공동 배치 제작 비용 절감</div>
          {(() => { const ds = ["P1", "P2"].filter((g) => mpwRes[g].done && mpwRes[g].r); const tot = ds.reduce((s, g) => s + mpwRes[g].r.needConv - mpwRes[g].r.needAi, 0);
            const base = ds.reduce((s, g) => s + mpwRes[g].r.needConv, 0);
            return <>
              <div className="icard-v sm">{ds.length ? manwon(tot, mp.eur) : "—"}</div>
              <div className="icard-s">{ds.length ? <>{ds.map((g) => `${g} 그룹 ${manwon(mpwRes[g].r.needConv - mpwRes[g].r.needAi, mp.eur)}`).join(" · ")} · 절감률 <b>{(tot / base * 100).toFixed(1)}%</b></> : "MPW AI 배치 전"}</div>
            </>; })()}
        </div>
        <div className="icard">
          <div className="icard-l">예상 양품 칩 증가</div>
          <div className="icard-v">{p1.run ? <><Num v={goodGain} d={0} sign ms={1200} /><small>개</small></> : "—"}</div>
          <div className="icard-s">{gs.filter((x) => x.qty > 0).map((x) => `${x.g} 그룹 ${x.qty.toLocaleString()}개 × ${x.run ? (x.dy >= 0 ? "+" : "") + x.dy.toFixed(1) + "%p" : "미적용"}`).join(" · ")}</div>
        </div>
        <div className="icard">
          <div className="icard-l">예상 비용 절감</div>
          <div className="icard-v sm">{ready ? <Num v={etchH * cost.etchRate + lineH * cost.lineRate} locale prefix="₩" ms={1200} /> : "—"}</div>
          <div className="icard-s">식각 장비 {won(etchH * cost.etchRate)} + 라인 전환 {won(lineH * cost.lineRate)}</div>
        </div>
      </div>

      <div className="impact-grid">
        <div className="panel">
          <h3>최적화 전후 비교</h3>
          <div className="scroll-x">
            <table className="tbl cmp">
              <thead><tr><th>항목</th><th className="r">기존</th><th className="r">AI 최적화</th><th className="r">변화</th></tr></thead>
              <tbody>
                <tr><td>P1 그룹 예상 수율</td><td className="r mono">{p1.by.toFixed(1)}%</td><td className="r mono hl">{ai(`${p1.r.y.toFixed(1)}%`, p1.run)}</td><td className="r mono pos">{p1.run ? `+${p1.dy.toFixed(1)}%p` : ""}</td></tr>
                <tr><td>P1 그룹 식각 압력</td><td className="r mono">{p1.G.baseline.P} mTorr</td><td className="r mono hl">{ai(`${p1.r.P} mTorr`, p1.run)}</td><td className="r mono">{p1.run ? `${(p1.r.P - p1.G.baseline.P).toFixed(1)}` : ""}</td></tr>
                <tr><td>P1 그룹 식각 시간</td><td className="r mono">{p1.G.baseline.t}초</td><td className="r mono hl">{ai(`${p1.r.t}초`, p1.run)}</td><td className="r mono pos">{p1.run ? `−${p1.dt.toFixed(1)}초` : ""}</td></tr>
                {p2.qty > 0 && <tr><td>P2 그룹 식각 압력</td><td className="r mono">{p2.G.baseline.P} mTorr</td><td className="r mono hl">{ai(`${p2.r.P} mTorr`, p2.run)}</td><td className="r mono">{p2.run ? `${(p2.r.P - p2.G.baseline.P).toFixed(1)}` : ""}</td></tr>}
                {p2.qty > 0 && <tr><td>P2 그룹 식각 시간</td><td className="r mono">{p2.G.baseline.t}초</td><td className="r mono hl">{ai(`${p2.r.t}초`, p2.run)}</td><td className="r mono pos">{p2.run ? `−${p2.dt.toFixed(1)}초` : ""}</td></tr>}
                {gs[1].qty > 0 && <tr><td>P2 그룹 예상 수율</td><td className="r mono">{gs[1].by.toFixed(1)}%</td><td className="r mono hl">{ai(`${gs[1].r.y.toFixed(1)}%`, gs[1].run)}</td><td className="r mono pos">{gs[1].run ? `+${gs[1].dy.toFixed(1)}%p` : ""}</td></tr>}
                <tr><td>공정 그룹 전환</td><td className="r mono">{baseSim.changes}회</td><td className="r mono hl">{ai(`${best.changes}회`, schedRun)}</td><td className="r mono pos">{schedRun ? `−${baseSim.changes - best.changes}회` : ""}</td></tr>
                <tr><td>레시피 전환 시간</td><td className="r mono">{baseSim.changeMin}분</td><td className="r mono hl">{ai(`${best.changeMin}분`, schedRun)}</td><td className="r mono pos">{schedRun ? `−${baseSim.changeMin - best.changeMin}분` : ""}</td></tr>
                <tr><td>납기 지연 런</td><td className="r mono">{baseSim.lateIds.length}건</td><td className="r mono hl">{ai(`${best.lateIds.length}건`, schedRun)}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <h3>예상 수율 (가상 모델)</h3>
          <CompareBars unit="%" domain={[0, 100]} data={gs.filter((x) => x.qty > 0).flatMap((x) => [
            { name: `${x.g} 그룹 기존`, v: x.by, c: "#9AA3AE" },
            { name: `${x.g} 그룹 AI`, v: x.run ? x.r.y : x.by, c: x.g === "P1" ? "#1F9C96" : "#C2477E" },
          ])} />
          <h3 className="mt">레시피 전환 시간 (분)</h3>
          <CompareBars unit="분" digits={0} domain={[0, Math.max(baseSim.changeMin, 1)]} data={[
            { name: "기존", v: baseSim.changeMin, c: "#9AA3AE" },
            { name: "AI", v: schedRun ? best.changeMin : baseSim.changeMin, c: "#D99A12" },
          ]} />
        </div>
      </div>

      <div className="impact-grid">
        <div className="panel">
          <h3>비용 계산 변수</h3>
          <div className="al-grid">
            <label className="al-f"><span>식각 장비 시간당 비용</span><span className="al-in"><input id="c-etch" type="number" step="50000" value={cost.etchRate} onChange={(e) => setC("etchRate", parseFloat(e.target.value))} /><small>원</small></span></label>
            <label className="al-f"><span>라인 전환 시간당 비용</span><span className="al-in"><input id="c-line" type="number" step="50000" value={cost.lineRate} onChange={(e) => setC("lineRate", parseFloat(e.target.value))} /><small>원</small></span></label>
            <label className="al-f"><span>그룹당 웨이퍼 수</span><span className="al-in"><input id="c-waf" type="number" step="1" value={cost.wafers} onChange={(e) => setC("wafers", parseFloat(e.target.value))} /><small>장</small></span></label>
            <label className="al-f"><span>웨이퍼당 식각 스텝</span><span className="al-in"><input id="c-steps" type="number" step="1" value={cost.steps} onChange={(e) => setC("steps", parseFloat(e.target.value))} /><small>회</small></span></label>
          </div>
        </div>
        <div className="panel">
          <h3>절감 시간은 따로 봐야 합니다</h3>
          <div className="split2">
            <div><div className="split-l">식각 장비 점유 시간</div><div className="split-v mono">{(etchH * 60).toFixed(1)}분</div>
              <div className="hint">식각 1회당 단축 시간 × 웨이퍼 {cost.wafers}장 × 스텝 {cost.steps}회</div></div>
            <div><div className="split-l">라인 그룹 전환 시간</div><div className="split-v mono">{(lineH * 60).toFixed(0)}분</div>
              <div className="hint">장비 준비·레시피 교체 횟수 감소분</div></div>
          </div>
          <p className="hint">두 값은 서로 다른 장비·단계의 시간입니다. 식각 단계 단축은 식각 챔버의 점유 시간을 줄일 뿐이고, 병목 공정이 아니면 전체 생산 기간을 그만큼 줄이지 않습니다.
            따라서 두 시간을 더해 “전체 생산 시간 단축”으로 보지 않으며, 비용만 각 시간당 비용으로 따로 환산해 합산했습니다.</p>
        </div>
      </div>
    </Section>
  );
}

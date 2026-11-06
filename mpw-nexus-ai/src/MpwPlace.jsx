import React, { useEffect, useMemo, useRef, useState } from "react";
import { GROUPS } from "./model.js";
import { Num, reduced, Section } from "./ui.jsx";
import { D, cellsOf, keyOf, mpwCalc, manwon, nf, MPW_DEFAULTS, MAX_QTY } from "./mpw.js";

const ease = (t) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const DUR = 420;

function readColors() {
  const s = getComputedStyle(document.documentElement), g = (n) => s.getPropertyValue(n).trim();
  return { A: g("--chipA"), B: g("--chipB"), C: g("--chipC"), D: g("--chipD"), E: g("--chipE"), F: g("--chipF"), G: g("--chipG"), H: g("--chipH"),
    hi: g("--wafer-hi"), lo: g("--wafer-lo"), grid: g("--wafer-grid"), teg: g("--teg"), line: g("--line") };
}
const chipVar = (id) => `var(--chip${id})`;

function setupCanvas(cv) {
  const dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 400;
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr); }
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return { ctx, S: w };
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function drawWafer(cv, pl, now) {
  const C = readColors();
  const { ctx, S } = setupCanvas(cv);
  const pad = S * 0.04, cell = (S - 2 * pad) / D, cx = S / 2, cy = S / 2, rad = (D / 2) * cell;
  ctx.clearRect(0, 0, S, S);
  const grd = ctx.createRadialGradient(cx - rad * .35, cy - rad * .4, rad * .1, cx, cy, rad);
  grd.addColorStop(0, C.hi); grd.addColorStop(1, C.lo);
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(cx, cy + rad, cell * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = C.grid;
  for (let r = 0; r < D; r++) for (let c = 0; c < D; c++) {
    const x = c + .5 - D / 2, y = r + .5 - D / 2;
    if (x * x + y * y < (D / 2 - .8) ** 2) ctx.strokeRect(pad + c * cell + .5, pad + r * cell + .5, cell - 1, cell - 1);
  }
  if (!pl) return { landed: 0, total: 0 };
  const anim = pl.running && !reduced();
  let landed = 0;
  pl.pieces.forEach((p, idx) => {
    let t = anim ? (now - pl.start - p.t0) / DUR : 1;
    if (t < 0) return;
    if (t >= 1 && !p.teg) landed++;
    t = Math.min(1, t);
    const tx = pad + p.x * cell, ty = pad + p.y * cell, w = p.w * cell, h = p.h * cell;
    if (p.teg) {
      if (!pl.running && pl.covered[idx]) return;
      ctx.globalAlpha = t * .9; ctx.fillStyle = C.teg; const s = cell * .36; ctx.fillRect(tx + (cell - s) / 2, ty + (cell - s) / 2, s, s); ctx.globalAlpha = 1; return;
    }
    const sy = -h - cell, y = sy + (ty - sy) * ease(t), ins = Math.max(1, cell * .1);
    rr(ctx, tx + ins, y + ins, w - 2 * ins, h - 2 * ins, Math.min(4, cell * .18)); ctx.fillStyle = C[p.id]; ctx.fill();
    if (cell > 9) { ctx.fillStyle = "rgba(255,255,255,.35)"; const s = Math.max(1.5, cell * .12); ctx.fillRect(tx + ins * 2, y + ins * 2, s, s); ctx.fillRect(tx + w - ins * 2 - s, y + h - ins * 2 - s, s, s); }
  });
  if (!pl.running && pl.sugg.length) {
    const a = reduced() ? .55 : .25 + .45 * (.5 + .5 * Math.sin(now / 240));
    pl.sugg.forEach((s) => {
      const tx = pad + s.x * cell, ty = pad + s.y * cell, w = s.w * cell, h = s.h * cell, ins = Math.max(1, cell * .1);
      rr(ctx, tx + ins, ty + ins, w - 2 * ins, h - 2 * ins, Math.min(4, cell * .18));
      ctx.globalAlpha = a; ctx.fillStyle = C[s.id]; ctx.fill(); ctx.globalAlpha = 1;
      ctx.setLineDash([3, 2]); ctx.lineWidth = 1.5; ctx.strokeStyle = C[s.id]; ctx.stroke(); ctx.setLineDash([]);
    });
  }
  return { landed, total: pl.pieces.filter((p) => !p.teg).length, pad, cell };
}

function GroupSwitch({ group, setGroup, busy, orders }) {
  return (
    <div className="tabs" role="tablist">
      {["P1", "P2"].map((g) => {
        const L = orders.filter((o) => o.group === g);
        return (
          <button key={g} role="tab" aria-selected={group === g} className={"tab " + g + (group === g ? " on" : "")} disabled={busy} onClick={() => setGroup(g)}>
            {g} 그룹 블록<span className="tab-n">{L.map((o) => o.id).join("·") || "없음"}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function MpwPlace(p) {
  const { orders, setOrders, group, setGroup, busy, compatDone, go, place, runPlace, applySugg, mp, setMp, placeBusy } = p;
  const list = useMemo(() => orders.filter((o) => o.group === group && o.qty > 0), [orders, group]);
  const other = group === "P1" ? "P2" : "P1";
  const otherList = orders.filter((o) => o.group === other);
  const pl = place[group];
  const fresh = pl && pl.key === keyOf(list);
  const done = fresh && !pl.running;
  const r = useMemo(() => mpwCalc(list, mp), [list, mp]);
  const [view, setView] = useState("wafer");
  const [envYear, setEnvYear] = useState(false);
  const cvRef = useRef(null), tipRef = useRef(null);
  const [status, setStatus] = useState("");

  // 그리기 루프 (낙하 애니메이션 + 추천 칩 깜빡임)
  useEffect(() => {
    if (view !== "wafer") return;
    let raf;
    const loop = (now) => {
      const cv = cvRef.current; if (!cv) return;
      const res = drawWafer(cv, fresh ? pl : null, now);
      if (fresh && pl.running) setStatus(`AI가 ${group} 그룹 칩을 배치하는 중 ${Math.min(res.landed, res.total)} / ${res.total}`);
      if (fresh && (pl.running || (pl.sugg.length && !reduced()))) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onR = () => { const cv = cvRef.current; if (cv) drawWafer(cv, fresh ? pl : null, performance.now()); };
    window.addEventListener("resize", onR);
    const mq = window.matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener && mq.addEventListener("change", onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); mq.removeEventListener && mq.removeEventListener("change", onR); };
  }, [pl, fresh, view, group]);

  const cnt = {}; if (done) pl.sugg.forEach((s) => (cnt[s.id] = (cnt[s.id] || 0) + 1));
  const placed = done ? pl.pieces.filter((x) => !x.teg).length : 0;
  const freeCells = done ? pl.pieces.filter((x) => x.teg).length : 0;
  const fillCells = done ? pl.pieces.reduce((s, x) => s + (x.teg ? 0 : x.w * x.h), 0) : 0;
  const fillPct = done ? Math.round(100 * fillCells / (fillCells + freeCells)) : 0;
  const leftAfter = done ? pl.pieces.filter((x, i) => x.teg && !pl.covered[i]).length : 0;
  const co = (id) => (orders.find((o) => o.id === id) || {}).company || id;

  const onMove = (e) => {
    const cv = cvRef.current, tip = tipRef.current; if (!cv || !tip) return;
    if (!done) { tip.style.opacity = 0; return; }
    const rect = cv.getBoundingClientRect(), S = rect.width, pad = S * 0.04, cell = (S - 2 * pad) / D;
    const c = Math.floor((e.clientX - rect.left - pad) / cell), rr2 = Math.floor((e.clientY - rect.top - pad) / cell);
    const s = pl.sugg.find((q) => c >= q.x && c < q.x + q.w && rr2 >= q.y && rr2 < q.y + q.h);
    const pc = !s && pl.pieces.find((q) => c >= q.x && c < q.x + q.w && rr2 >= q.y && rr2 < q.y + q.h);
    let txt = "";
    if (s) txt = `추천: ${co(s.id)} 칩을 1개 더 넣을 수 있는 자리`;
    else if (pc && pc.teg) txt = "같은 셔틀의 다른 참가 프로젝트 영역";
    else if (pc) { const o = orders.find((x) => x.id === pc.id); txt = `${o.company} ${o.chip} #${pc.n} (${o.w}×${o.h} mm)`; }
    if (!txt) { tip.style.opacity = 0; return; }
    tip.textContent = txt;
    // 툴팁이 캔버스 밖(화면 밖)으로 나가지 않도록 가로 위치를 안쪽으로 당김
    const x = e.clientX - rect.left, half = tip.offsetWidth / 2;
    tip.style.left = Math.min(S - half, Math.max(half, x)) + "px"; tip.style.top = (e.clientY - rect.top) + "px"; tip.style.opacity = 1;
  };
  const hideTip = () => { if (tipRef.current) tipRef.current.style.opacity = 0; };
  // 마우스는 움직일 때, 터치·펜은 탭할 때 툴팁 표시
  const onPointerMove = (e) => { if (e.pointerType === "mouse") onMove(e); };
  const onPointerDown = (e) => { if (e.pointerType !== "mouse") onMove(e); };
  const onPointerLeave = (e) => { if (e.pointerType === "mouse") hideTip(); };

  // "더 넣을 수 있는 수량": 큰 화면은 웨이퍼 오른쪽 아래에 겹쳐, 작은 화면은 캔버스 아래에 표시 (CSS로 둘 중 하나만 보임)
  const addable = done && pl.sugg.length > 0 ? <>
    <div>더 넣을 수 있는 수량</div>
    {list.map((o) => <div key={o.id} className="row"><i style={{ "--c": chipVar(o.id) }} />{o.company} <b>+{cnt[o.id] || 0}개</b></div>)}
  </> : null;

  const setQty = (id, v) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, qty: Math.max(1, Math.min(MAX_QTY, v)) } : o)));
  const eur = mp.eur;
  const W = (v) => manwon(v, eur);

  // 효과 수치
  let eff = null;
  if (r && done) {
    const tU = r.useful / r.convBuy * 100, mU = r.useful / r.aiBuy * 100;
    const save = r.needConv - r.needAi, bill = r.convCost - r.aiCost;
    const wConv = (r.convBuy - r.useful) / 100, wAi = (r.aiBuy - r.useful) / 100;
    const mult = envYear ? mp.perYear : 1, cm2 = r.savedCm2 * mult;
    eff = { tU, mU, save, bill, wConv, wAi, wp: wConv > 0 ? (1 - wAi / wConv) * 100 : 0, cm2, water: cm2 * mp.water, kwh: cm2 * mp.kwh, co2: cm2 * mp.co2 };
  }

  const head = (
    <div className="fx-actions">
      <GroupSwitch group={group} setGroup={setGroup} busy={busy} orders={orders} />
      <button className="btn primary" onClick={() => runPlace(group)} disabled={busy || !compatDone || !list.length}>
        {placeBusy === group ? <><span className="spin" /> 배치 중…</> : fresh ? "AI 배치 다시 실행" : "AI 배치 실행"}
      </button>
    </div>
  );

  return (
    <Section id="mpw" idx="03" kicker="MPW AI Placement" title="호환 그룹별 MPW 공동 집적" actions={head}>
      {!compatDone ? (
        <div className="panel need">
          <p><b>공정 호환성 분석이 먼저 필요합니다.</b> 같은 공정 그룹으로 판정된 회사의 칩끼리만 한 MPW 블록에 묶어 웨이퍼에 배치합니다.</p>
          <button className="btn primary" onClick={() => go("compat")}>공정 호환성 분류로 이동 ›</button>
        </div>
      ) : <>
      <p className="lead fx-lead">
        회사마다 MPW 자리를 따로 사면 최소 과금 면적 때문에 빈 실리콘에도 돈을 냅니다. AI가 <b>호환성 분류에서 같은 그룹으로 판정된 회사의 설계만</b> 한 블록에 빈틈없이 배치해
        과금 면적, 버려지는 웨이퍼 면적, 출하 준비 기간을 함께 줄입니다. 지금 보는 블록: <b className={"g-ink " + group}>{group} 그룹 · {list.map((o) => o.company).join(", ") || "주문 없음"}</b>
        {otherList.length > 0 && <> (다른 그룹 {other}: {otherList.map((o) => o.company).join(", ")}는 별도 블록)</>}
      </p>

      <div className="fx-stage">
        <section className="panel fx-wafer" aria-label="배치 시뮬레이션">
          <div className="fx-whead">
            <div className="fx-seg" role="group" aria-label="보기 방식">
              <button aria-pressed={view === "wafer"} onClick={() => setView("wafer")}>웨이퍼 배치 (AI)</button>
              <button aria-pressed={view === "area"} onClick={() => setView("area")}>실제 면적 비교</button>
            </div>
          </div>
          {view === "wafer" ? (
            <div className="fx-wview">
              <div className="fx-canvas" onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerLeave={onPointerLeave}>
                <canvas ref={cvRef} role="img" aria-label={`${group} 그룹 회사의 칩이 한 웨이퍼에 배치된 모습`} />
                <div className="fx-tip" ref={tipRef} />
                {addable && <div className="fx-addable ov">{addable}</div>}
              </div>
              {addable && <div className="fx-addable below">{addable}</div>}
              <div className="fx-status">
                {!fresh ? (pl ? <>주문이 바뀌었습니다. <b>AI 배치 다시 실행</b>을 누르면 다시 배치합니다.</> : <><b>AI 배치 실행</b>을 누르면 {group} 그룹 칩이 웨이퍼에 쌓입니다.</>)
                  : pl.running ? status
                  : freeCells === 0 ? <>배치 완료: {group} 그룹 {list.length}개 회사 칩 <b>{nf(placed)}개</b>, 웨이퍼 빈칸 <b>0</b></>
                  : pl.sugg.length ? <>배치 완료: 칩 {nf(placed)}개, 웨이퍼 <b>{fillPct}%</b> 채움. 깜빡이는 자리에 {list.filter((o) => cnt[o.id]).map((o, i) => <React.Fragment key={o.id}>{i ? ", " : ""}{o.company} <b>{cnt[o.id]}개</b></React.Fragment>)}를 더 넣으면 빈칸이 <b>{leftAfter}개</b>로 줄어듭니다. <button className="fx-toggle" onClick={() => applySugg(group)} disabled={busy}>추천 반영</button></>
                  : <>배치 완료: 칩 <b>{nf(placed)}개</b>, 남은 칸 {freeCells}개</>}
              </div>
            </div>
          ) : (
            <AreaView list={list} r={r} mp={mp} />
          )}
          <div className="fx-legend">
            {list.map((o) => <span key={o.id}><i className="fx-sw" style={{ "--c": chipVar(o.id) }} />{o.company} {o.chip.split(" ")[0]}</span>)}
            {view === "wafer" && done && pl.sugg.length > 0 && <span><i className="fx-sw spare" style={{ "--c": "var(--cyan)" }} />깜빡임: 빈자리에 넣을 추천 칩</span>}
            {view === "wafer" && done && leftAfter > 0 && <span><i className="fx-sw teg" />다른 참가 프로젝트 영역</span>}
            {view === "area" && <span><i className="fx-sw spare" style={{ "--c": "var(--trad)" }} />과금됐지만 비어 있는 면적</span>}
          </div>
        </section>

        <section className={"panel fx-effects" + (eff ? "" : " idle")} aria-live="polite">
          <h3>개별 MPW 신청 대비 AI 공동 배치 효과 · {group} 그룹</h3>
          <p className="fx-basis">{eff ? `공정 0.18µm (X-FAB XP018). 단가는 Europractice 2026 X-FAB XP018 4M 기본 구성 표준 공시가 기준. ${r.n}개 회사, 칩 ${nf(r.chips)}개. 환율 1 € = ${nf(eur)}원.` : "배치가 끝나면 계산됩니다."}</p>

          <div className="fx-metric">
            <div className="fx-mhead"><span className="fx-mname">집적도 (과금 면적 중 실제 칩 면적)</span><span className="fx-big">{eff ? <Num v={eff.mU - eff.tU} d={0} prefix="+" suffix="%p" ms={800} /> : "–"}</span></div>
            <div className="fx-bars">
              <div className="fx-bar t"><span>개별 신청</span><div className="fx-track"><div className="fx-fill" style={{ width: eff ? eff.tU + "%" : 0 }}><em>칩이 채운 면적</em></div></div><span className="fx-v">{eff ? eff.tU.toFixed(0) + "%" : "–"}</span></div>
              <div className="fx-bar m"><span>AI 공동</span><div className="fx-track"><div className="fx-fill" style={{ width: eff ? eff.mU + "%" : 0 }}><em>AI 배치로 칩이 채운 면적</em></div></div><span className="fx-v">{eff ? eff.mU.toFixed(0) + "%" : "–"}</span></div>
            </div>
            <p className="fx-note">막대 길이 = 납품받는 MPW 실리콘 중 주문한 칩이 실제로 쓰는 비율(칩 수량에 따라 변함).{eff && <> 왼쪽 웨이퍼 배치 채움률 <b>{fillPct}%</b> (칩 {nf(r.chips)}개)</>}</p>
          </div>

          <div className="fx-metric">
            <div className="fx-mhead"><span className="fx-mname">총 제작 비용 절감 (주문 칩 기준)</span><span className="fx-big">{eff ? W(eff.save) : "–"}</span></div>
            <p className="fx-line">{eff ? <>주문 칩 {nf(r.chips)}개에 드는 비용 개별 신청 <b>{W(r.needConv)}</b> → AI 공동 <b>{W(r.needAi)}</b>. 실제 청구액은 최소 납품분까지 포함해 {W(r.convCost)} → {W(r.aiCost)} (절감 {W(eff.bill)}), 과금 면적 {r.convCharged} → {r.aiCharged} mm²</> : "–"}</p>
            <div className="fx-chips">
              <div>절감률<b>{eff ? (eff.save / r.needConv * 100).toFixed(1) + "%" : "–"}</b></div>
              <div>칩 1개당 비용<b>{eff ? `${nf(r.needConv * eur / r.chips / 10000)} → ${nf(r.needAi * eur / r.chips / 10000)}만원` : "–"}</b></div>
              <div>칩 1개당 절감<b>{eff ? `${nf(eff.save * eur / r.chips / 10000)}만원` : "–"}</b></div>
            </div>
          </div>

          <div className="fx-metric">
            <div className="fx-mhead"><span className="fx-mname">버려지는 웨이퍼 면적</span><span className="fx-big">{eff ? <Num v={eff.wp} d={0} prefix="−" suffix="%" ms={800} /> : "–"}</span></div>
            <p className="fx-line">{eff ? <>주문 칩 {nf(r.chips)}개에 필요한 실리콘은 {nf(r.useful / 100, 1)} cm²인데, 납품받는 면적은 개별 신청 {nf(r.convBuy / 100, 1)} cm², AI 공동 {nf(r.aiBuy / 100, 1)} cm²입니다. 버려지는 면적 <b>{nf(eff.wConv, 1)} → {nf(eff.wAi, 1)} cm²</b>.</> : "–"}</p>
          </div>

          <div className="fx-env">
            <div className="fx-env-top">
              <b>환경 부담 감소</b>
              <div className="fx-seg" role="group" aria-label="환경 효과 범위">
                <button aria-pressed={!envYear} onClick={() => setEnvYear(false)}>이번 셔틀</button>
                <button aria-pressed={envYear} onClick={() => setEnvYear(true)}>연간 환산</button>
              </div>
            </div>
            <div className="fx-env-nums">
              <div>물 사용<b>{eff ? (eff.water >= 1000 ? `${nf(eff.water / 1000, 1)}톤` : `${nf(eff.water)} L`) : "–"}</b></div>
              <div>전력<b>{eff ? (eff.kwh >= 1000 ? `${nf(eff.kwh / 1000, 2)} MWh` : `${nf(eff.kwh)} kWh`) : "–"}</b></div>
              <div>온실가스<b>{eff ? (eff.co2 >= 1000 ? `${nf(eff.co2 / 1000, 2)} tCO₂e` : `${nf(eff.co2)} kgCO₂e`) : "–"}</b></div>
            </div>
            <p className="fx-env-eq">{eff ? (envYear
              ? <>연간 {mp.perYear}건을 묶으면 200mm 웨이퍼 약 <b>{nf(eff.cm2 / (Math.PI * 100), 1)}장</b>만큼의 가공을 줄입니다. 2L 생수 약 {nf(eff.water / 2)}병 분량의 물입니다.</>
              : <>이번 셔틀에서 가공하지 않아도 되는 웨이퍼 면적 {nf(eff.cm2, 1)} cm² 기준입니다. 2L 생수 약 {nf(eff.water / 2)}병 분량의 물입니다.</>) : "가공하지 않아도 되는 웨이퍼 면적만큼 줄어드는 양입니다."}</p>
            <p className="fx-env-src">근거: 반도체 업계 평균 웨이퍼 1 cm² 가공당 물 8.22 L, 전력 1.15 kWh, 온실가스 0.84 kgCO₂e (<a href="https://doi.org/10.1016/j.watcyc.2023.01.004" target="_blank" rel="noopener">Wang 외, Water Cycle 4권, 2023</a>). 줄어드는 면적 = 납품 실리콘 차이 × 가공 배수(가정 {nf(mp.copies, 1)}배).</p>
          </div>
        </section>
      </div>

      <GroupSummary orders={orders} place={place} mp={mp} />

      {r && <Ship r={r} mp={mp} n={list.length} />}

      <h3 className="mt">회사별 비용 · {group} 그룹 <span className="hint">주문 칩 기준. AI 분담금은 칩 면적 비율로 나눕니다.</span></h3>
      <div className="panel fx-tblp">
        <div className="scroll-x">
          {r && (
            <table className="tbl fx-tbl">
              <thead><tr><th>회사</th><th>칩</th><th>다이 크기</th><th className="r">수량</th><th className="r">개별 신청 비용</th><th className="r">AI 공동 분담금</th><th className="r">절감액</th><th className="r">칩 1개당 절감</th></tr></thead>
              <tbody>
                {r.per.map((x) => (
                  <tr key={x.o.id}>
                    <td><span className="fx-dot" style={{ "--c": chipVar(x.o.id) }} />{x.o.company}</td><td>{x.o.chip}</td><td className="mono">{x.o.w}×{x.o.h} mm</td>
                    <td className="r mono">{nf(x.o.qty)}개</td><td className="r">{W(x.needConv)}</td><td className="r">{W(x.needAi)}</td>
                    <td className="r fx-save">{W(x.needConv - x.needAi)}</td><td className="r">{nf((x.needConv - x.needAi) * eur / x.o.qty / 10000, 1)}만원</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td>합계</td><td /><td /><td className="r mono">{nf(r.chips)}개</td><td className="r">{W(r.needConv)}</td><td className="r">{W(r.needAi)}</td><td className="r fx-save">{W(r.needConv - r.needAi)}</td><td className="r">{nf((r.needConv - r.needAi) * eur / r.chips / 10000, 1)}만원</td></tr></tfoot>
            </table>
          )}
        </div>
      </div>

      <details className="fx-assume">
        <summary>계산 기준과 가정치 (바꾸면 바로 반영)</summary>
        <div className="fx-params">
          {Object.entries(MPW_DEFAULTS).map(([k, d]) => (
            <label key={k}>{d.l}<input type="number" step={d.step || 1} value={mp[k]} disabled={busy}
              onChange={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v) && v >= 0) setMp((m) => ({ ...m, [k]: v })); }} /></label>
          ))}
        </div>
        <p className="fx-fine">공시가로 확인한 값: X-FAB XP018 0.18µm MPW 표준가 1,126 €/mm²(4층 금속 기본 구성, 선택 모듈 추가 시 상승), 최소 과금 10 mm², 기본 50개 납품, 추가 다이 25 €/개(최대 50개), 4개 이상 설계를 한 신청에 묶을 때 검증비 1,000 €, 샘플까지 약 23주(2026년 6·9월 셔틀 기준), 연 3회 셔틀(2026년 GDS 마감 2월 18일, 6월 17일, 9월 23일). 환율은 2026년 11월 5일 하나은행 매매기준율 1,506.15원을 반올림했습니다.
          나머지(다이 간격, 준비 기간, 가공 배수, 연간 처리 건수, 서비스 수수료, 분리 절단 비용)는 초안용 가정치입니다. 패키징·테스트 비용은 두 방식에 똑같이 들어가므로 제외했습니다.
          웨이퍼 배치도는 칩 크기를 격자로 단순화한 개념도입니다.</p>
        <ul className="fx-sources">
          <li><a href="https://europractice-ic.com/schedules-prices-2026/" target="_blank" rel="noopener">Europractice 2026 MPW 일정·가격표</a>: X-FAB XP018 가격, 최소 면적, 납품 수량, 추가 다이 가격, 다중 설계 검증비</li>
          <li><a href="https://www.xfab.com/manufacturing/prototyping" target="_blank" rel="noopener">X-FAB 프로토타이핑 일정</a>: XP018 테이프인부터 샘플 출하까지 일정(2026년 셔틀 약 23주)</li>
          <li><a href="https://doi.org/10.1016/j.watcyc.2023.01.004" target="_blank" rel="noopener">Wang 외, Water Cycle (2023)</a>: 웨이퍼 cm²당 물 8.22 L, 전력 1.15 kWh, 온실가스 0.84 kgCO₂e</li>
          <li>Europractice TSMC MPW 안내: 하위 설계 분리 절단 추가 다이당 6 USD (X-FAB에도 같은 수준으로 가정)</li>
        </ul>
      </details>
      </>}
    </Section>
  );
}

function AreaView({ list, r, mp }) {
  if (!r) return <p className="fx-cap">이 그룹에 주문이 없습니다.</p>;
  const gap = mp.gap, block = r.block, side = Math.sqrt(mp.minArea);
  const k = 150 / Math.max(side, block.W, block.H);
  const hatch = (id) => (
    <defs><pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style={{ stroke: "var(--trad)" }} strokeWidth="2" opacity=".55" /></pattern></defs>
  );
  return (
    <div className="fx-blocks">
      <p className="fx-cap">같은 축척(1 mm = {k.toFixed(0)}px)으로 그린 MPW 과금 영역입니다. 빗금은 돈을 내고도 비어 있는 실리콘입니다.</p>
      {list.map((o) => {
        const charged = Math.max(mp.minArea, Math.ceil(o.w * o.h - 1e-9)), s = Math.sqrt(charged) * k;
        const empty = (charged - o.w * o.h) / charged * 100;
        return (
          <div key={o.id} className="fx-blk">
            <svg width={s + 2} height={s + 2} viewBox={`-1 -1 ${s + 2} ${s + 2}`} role="img" aria-label={`${o.company} 개별 자리`}>
              {hatch("hz" + o.id)}
              <rect x="0" y="0" width={s} height={s} fill={`url(#hz${o.id})`} style={{ stroke: "var(--line2)" }} />
              <rect x={gap * k / 2} y={gap * k / 2} width={o.w * k} height={o.h * k} rx="2" style={{ fill: `var(--chip${o.id})` }} />
            </svg>
            <p><b>{o.company} 개별 자리</b><br />{charged} mm² 과금, 빈 면적 {empty.toFixed(0)}%</p>
          </div>
        );
      })}
      <div className="fx-blk ai">
        <svg width={block.W * k + 2} height={block.H * k + 2} viewBox={`-1 -1 ${block.W * k + 2} ${block.H * k + 2}`} role="img" aria-label="AI 공동 블록">
          {hatch("hzai")}
          <rect x="0" y="0" width={block.W * k} height={block.H * k} fill="url(#hzai)" style={{ stroke: "var(--cyan)" }} strokeWidth="2" />
          {block.pl.map((p, i) => {
            const w = (p.rot ? p.o.h : p.o.w) * k, h = (p.rot ? p.o.w : p.o.h) * k;
            return <rect key={i} x={p.x * k + gap * k / 2} y={p.y * k + gap * k / 2} width={w} height={h} rx="2" style={{ fill: `var(--chip${p.o.id})` }} />;
          })}
        </svg>
        <p><b>AI 공동 블록</b><br />{block.W.toFixed(1)}×{block.H.toFixed(1)} mm, {r.aiCharged} mm² 과금, 빈 면적 {(r.aiEmpty * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
}

function GroupSummary({ orders, place, mp }) {
  const rows = ["P1", "P2"].map((g) => {
    const L = orders.filter((o) => o.group === g && o.qty > 0);
    const r = mpwCalc(L, mp), pl = place[g];
    return { g, L, r, done: !!(pl && !pl.running && pl.key === keyOf(L)) };
  }).filter((x) => x.L.length);
  const doneRows = rows.filter((x) => x.done);
  const tot = doneRows.reduce((s, x) => s + (x.r.needConv - x.r.needAi), 0);
  return (
    <div className="panel fx-sum">
      <div className="fx-sum-h"><b>그룹별 MPW 블록 요약</b><span className="hint">호환성 분류 결과대로 그룹마다 별도 블록을 만듭니다. 서로 다른 그룹의 칩은 같은 블록에 섞지 않습니다.</span></div>
      <div className="fx-sum-grid">
        {rows.map((x) => (
          <div key={x.g} className={"fx-sum-c " + x.g}>
            <div><span className={"tag " + x.g}>{x.g} 그룹</span> {x.L.map((o) => o.company).join(" + ")}</div>
            <div className="mono">블록 {x.r.block.W.toFixed(1)}×{x.r.block.H.toFixed(1)} mm · 과금 {x.r.convCharged} → {x.r.aiCharged} mm²</div>
            <div>{x.done ? <>비용 절감 <b>{manwon(x.r.needConv - x.r.needAi, mp.eur)}</b> ({((x.r.needConv - x.r.needAi) / x.r.needConv * 100).toFixed(1)}%)</> : <span className="muted">AI 배치 실행 전</span>}</div>
          </div>
        ))}
        <div className="fx-sum-c tot">
          <div>전체 합계 ({doneRows.length}/{rows.length} 그룹 배치 완료)</div>
          <div className="fx-sum-big">{doneRows.length ? manwon(tot, mp.eur) : "–"}</div>
          <div className="muted">주문 칩 기준 총 제작 비용 절감</div>
        </div>
      </div>
    </div>
  );
}

function Ship({ r, mp, n }) {
  const max = Math.max(r.tInd, r.tAi), wait = mp.cadence / 2, mo = (w) => nf(w / 4.345, 1);
  const seg = (cls, v, label, short) => (
    <div className={"fx-gseg " + cls} style={{ width: `${v / max * 100}%` }} title={`${label} ${nf(v, 1)}주`}>{v / max > 0.1 ? label : short || ""}</div>
  );
  const ax = []; const step = max > 40 ? 10 : 5; for (let i = 0; i <= max; i += step) ax.push(<span key={i}>{i}주</span>);
  return (
    <>
      <h3 className="mt">출하 일정 비교</h3>
      <div className="panel fx-sched">
        <div className="fx-shero"><span className="fx-sbig">{mo(r.tInd - r.tAi)}개월 빠른 출하</span>
          <p>{n}개 회사가 각자 자리 배치, 설계 규칙 검사, 등록, 견적을 진행하면 약 <b>{mp.prepInd}주</b>, AI가 한 블록으로 통합·검증하면 약 <b>{mp.prepAi}주</b>입니다. 셔틀 대기는 연 3회 운행 기준 평균값, 공정 기간은 공시 일정의 약 {mp.lead}주를 썼습니다.</p></div>
        <div className="fx-gantt">
          <div className="fx-glabel">개별 MPW 신청<small>평균 {mo(r.tInd)}개월</small></div>
          <div className="fx-gtrack">{seg("prep", mp.prepInd, `${n}사 개별 준비·등록`)}{seg("wait", wait, "셔틀 대기")}{seg("fab", mp.lead, "웨이퍼 공정·샘플 출하")}</div>
          <div className="fx-glabel">AI 공동 배치<small>평균 {mo(r.tAi)}개월</small></div>
          <div className="fx-gtrack">{seg("prep ai", mp.prepAi, "AI 배치", "AI 배치")}{seg("wait", wait, "셔틀 대기")}{seg("fab", mp.lead, "웨이퍼 공정·샘플 출하")}</div>
          <div className="fx-gaxis">{ax}</div>
          <p className="fx-gkey"><i />노란 칸: AI 통합 배치·검증 {mp.prepAi}주 (개별 신청의 {n}사 준비·등록 {mp.prepInd}주에 해당하는 단계)</p>
        </div>
      </div>
    </>
  );
}

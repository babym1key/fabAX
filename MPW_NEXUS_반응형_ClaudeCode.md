# MPW NEXUS AI × FabShare — 반응형 웹 전환용 프로젝트 파일 (Claude Code용)

AX Challenge 발표용 **AI 기반 MPW 공정 호환성 분류 · MPW 공동 집적 · 수율 최적화 시뮬레이터**의 현재 전체 소스입니다.
이 파일 하나로 Claude Code가 현재 아티팩트와 똑같은 웹페이지를 다시 만들고, 이어서 **반응형 웹**으로 다듬을 수 있습니다.

## Claude Code에게 이렇게 요청하세요

> 이 md 파일의 '파일' 절에 있는 코드를 경로 그대로 저장해서 프로젝트를 만들고, `npm install` 후 `python3 build.py`로 빌드해 `dist/standalone.html`이 지금처럼 동작하는지 먼저 확인해줘.
> 그다음 '반응형 작업 요구사항' 절대로 반응형 웹으로 고쳐줘. 계산 로직(`model.js`, `mpw.js`)과 수치는 바꾸지 말고, 레이아웃·CSS·필요한 마크업만 수정해줘.
> 작업이 끝나면 390px, 768px, 1024px, 1440px 폭에서 스크린샷을 찍어 가로 스크롤이 없는지 확인해줘.

## 직접 실행하는 방법 (Node.js 18 이상, Python 3 필요)

1. 아래 '파일' 절의 각 코드 블록을 제목에 적힌 경로 그대로 저장합니다.
2. 프로젝트 폴더에서 실행합니다.

```bash
npm install
python3 build.py
```

3. `dist/standalone.html`을 브라우저에서 엽니다(서버 불필요). `dist/mpw-nexus-ai.html`은 claude.ai 아티팩트로 게시할 때 쓰는 본문 조각입니다.

## 화면 구성 (7단계)

| 화면 | 내용 |
|---|---|
| 01 Overview | 주문 목록(회사·칩 이름, 크기 mm, 수량 1~100, 기본 플랫폼, 식각 대상, 납기) 편집, 회사 2~8개 추가·삭제 |
| 02 Compatibility AI | 플랫폼·식각 재료 기준 P1 / P2 / 배정 보류 판정, 카드 이동 애니메이션 |
| 03 MPW AI Placement | **FabShare 콘솔.** 같은 그룹 칩만 한 MPW 블록으로 웨이퍼에 AI 배치(낙하 애니메이션), 빈자리 추천 칩 깜빡임, "추천 반영" 한 번에 반영, 실제 면적 비교, 집적도·비용·버려지는 면적·환경 효과, 그룹별 요약, 출하 일정, 회사별 비용, 계산 기준(접힘) |
| 04 Recipe Optimizer | 압력·시간 슬라이더, 허용 범위 내 0.5 단위 격자 전수 탐색 |
| 05 Yield Simulator | 압력·시간 단면 곡선(A, B)과 2차원 수율 히트맵(C) |
| 06 Production Scheduler | 모든 순서 전수 탐색, 간트 차트 |
| 07 AI Impact Report | 수율 개선, 식각·전환 시간 절감, MPW 공동 배치 비용 절감, 양품 칩 증가, 비용 절감 |

기본 주문(호환성 분류 결과): **P1 그룹 = A사·B사·E사**(0.18µm CMOS, Poly-Si 또는 TiN), **P2 그룹 = C사·D사**(0.18µm BCD, 후막 금속).
기본 수량 A 36, B 40, E 31 / C 43, D 46 → 그룹별 웨이퍼 약 80% 채움.

"전체 AI 최적화 실행" 흐름(약 20.5초): 02 호환성 분석 → 03 P1·P2 웨이퍼 배치(그룹당 배치 후 1.2초 대기) → 04 레시피 → 06 스케줄 → 07 리포트.

디자인: FabShare 톤(밝은 회색 #E8EBEE 바탕, 노란 강조 #D99A12, IBM Plex Sans KR), `prefers-color-scheme` 다크 모드 지원. 회사 색은 `--chipA`~`--chipH` CSS 변수.

수율 모델(가상, 교육용): `Y(P,t) = Ymax · exp(−[a(P−P*)² + b(t−t*)²])`. MPW 가격은 Europractice 2026 X-FAB XP018(4M 기본 구성) 공시가, 샘플 기간은 X-FAB 2026 일정(약 23주), 환율은 2026년 11월 5일 하나은행 매매기준율(1,506원/€) 기준이고, 나머지는 가정치입니다.

## 반응형 작업 요구사항

### 기준 폭(브레이크포인트)

| 구간 | 폭 | 레이아웃 |
|---|---|---|
| 데스크톱 | 1280px 이상 | 현재 그대로: 왼쪽 고정 사이드바 + 본문, 03의 웨이퍼·효과 두 칸 |
| 태블릿 | 768~1279px | 사이드바를 아이콘+번호만 남긴 좁은 형태(약 72px) 또는 상단 메뉴로, 두 칸 영역은 1100px 미만에서 한 칸 |
| 모바일 | 767px 이하 | 상단 메뉴(가로 스크롤 탭 또는 햄버거), 모든 영역 한 칸, 좌우 여백 16px |

### 현재 상태 (이미 되어 있는 것)

- 860px 이하에서 사이드바가 위로 올라가 가로 스크롤 메뉴가 됨
- 03의 웨이퍼·효과 패널은 1100px 미만에서 위아래로 쌓임
- 390px 폭에서 페이지 전체 가로 스크롤은 없음

### 고칠 것

1. **01 주문 목록 표**: 모바일에서 표를 옆으로 밀어야 보입니다. 767px 이하에서는 회사별 **카드 목록**(회사·칩 / 크기·수량 / 플랫폼·식각 대상 / 납기, 삭제 버튼)으로 바꿔 주세요. 입력칸은 그대로 편집 가능해야 합니다.
2. **03 집적도 막대 글자**: 막대가 짧으면 "칩이 채운 면적" 글자가 잘립니다. 막대 폭이 좁을 때는 막대 안 글자를 숨기거나 막대 위로 옮겨 주세요.
3. **상단 바(topbar)**: 모바일에서 5단계 진행 표시(호환성 분석 … 결과 리포트)가 세 줄로 늘어납니다. 모바일에서는 한 줄 가로 스크롤 또는 점(●) 진행 표시로 줄이고, "전체 AI 최적화 실행" 버튼은 화면 폭을 꽉 채우게 해 주세요.
4. **메뉴**: 모바일 상단 메뉴에서 현재 화면 탭이 보이도록 자동 스크롤(scrollIntoView)해 주세요. 메뉴 높이는 최대한 낮게(제목+번호 한 줄).
5. **03 웨이퍼 캔버스**: 터치에서도 칩 정보가 보이도록 `pointerdown`/탭으로 툴팁을 띄워 주세요(지금은 `mousemove`만 지원). 오른쪽 아래 "더 넣을 수 있는 수량" 상자가 작은 화면에서 웨이퍼를 가리면 캔버스 아래로 옮겨 주세요.
6. **05 히트맵·곡선**: 모바일에서 히트맵이 폭에 맞게 줄어들고 글자가 읽힐 수 있게(최소 11px) 해 주세요. 히트맵 드래그는 터치로도 되게 해 주세요.
7. **06 간트 차트**: 좁은 화면에서 막대 라벨이 겹치지 않게 하거나, 차트만 가로 스크롤 영역 안에 넣어 주세요(페이지 전체 가로 스크롤은 금지).
8. **07 리포트 카드·표**: 카드 그리드는 모바일에서 1열, 태블릿에서 2열. 비교 표는 모바일에서 표 영역만 가로 스크롤.
9. **공통**: 버튼·입력칸 터치 영역 최소 44px, 본문 글자 최소 14px, `env(safe-area-inset-*)` 유지, `prefers-reduced-motion` 유지, 다크 모드 유지.

### 바꾸지 말 것

- `src/model.js`, `src/mpw.js`의 계산식과 기본값(수율 모델, MPW 가격·가정치, 배치 알고리즘)
- 호환성 분류 결과에 따라 그룹별로만 웨이퍼 블록을 만드는 규칙(P1 블록에는 P1 회사 칩만)
- "전체 AI 최적화 실행"의 단계 순서와 시간(03 그룹당 배치 후 1.2초 대기)

### 확인 방법

Playwright로 390×844(iPhone), 768×1024(태블릿), 1024×768, 1440×900에서 7개 화면을 각각 캡처하고, 각 폭에서 `document.documentElement.scrollWidth <= window.innerWidth`인지 확인하세요. "전체 AI 최적화 실행"을 끝까지 돌려 콘솔 오류가 없는지도 확인하세요.

## 폴더 구조

```
mpw-nexus-ai/
├── package.json
├── build.py
└── src/
    ├── main.jsx
    ├── model.js       # 수율·레시피·스케줄·호환성 모델
    ├── mpw.js         # FabShare MPW 배치·비용·환경 계산
    ├── ui.jsx
    ├── charts.jsx
    ├── MpwPlace.jsx   # 03 MPW AI Placement 화면
    ├── App.jsx
    └── style.css
```

## 파일

### `package.json`

```json
{
  "name": "mpw-nexus-ai",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "recharts": "2.12.7"
  },
  "devDependencies": {
    "esbuild": "0.23.1"
  }
}
```

### `build.py`

```python
import subprocess, pathlib
subprocess.run(["npx","esbuild","src/main.jsx","--bundle","--minify","--format=iife","--define:process.env.NODE_ENV=\"production\"","--outfile=dist/app.js","--jsx=automatic","--loader:.js=jsx"],check=True)
js=pathlib.Path("dist/app.js").read_text().replace("</script","<\\/script")
css=pathlib.Path("src/style.css").read_text()
head='''<title>MPW NEXUS AI</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap">
'''
frag=head+f"<style>\n{css}\n</style>\n<div id=\"root\"></div>\n<script>\n{js}\n</script>\n"
pathlib.Path("dist/mpw-nexus-ai.html").write_text(frag)
full='<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+head+f"<style>\n{css}\n</style>\n</head>\n<body>\n<div id=\"root\"></div>\n<script>\n{js}\n</script>\n</body>\n</html>\n"
pathlib.Path("dist/standalone.html").write_text(full)
print(len(frag))
```

### `src/main.jsx`

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(<App />);
```

### `src/model.js`

```js
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
```

### `src/mpw.js`

```js
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
```

### `src/ui.jsx`

```jsx
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
```

### `src/charts.jsx`

```jsx
import React, { useMemo, useRef } from "react";
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
export function Heatmap({ group, P, t, allowed, rec, showRec, onPick, scan }) {
  const g = GROUPS[group];
  const W = 640, H = 470, L = 58, R = 16, T = 14, B = 52;
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
  const svgRef = useRef(null);
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
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
      onPointerMove={(e) => { if (e.buttons === 1) pick(e); }}>
      <defs>
        <clipPath id="plotclip"><rect x={L} y={T} width={pw} height={ph} /></clipPath>
      </defs>
      <image href={url} x={L} y={T} width={pw} height={ph} preserveAspectRatio="none" style={{ imageRendering: "pixelated" }} />
      <g clipPath="url(#plotclip)">
        {contours.map((c) => (
          <g key={c.lv}>
            <ellipse cx={sx(m.P0)} cy={sy(m.t0)} rx={(c.rx / (SLIDER.pMax - SLIDER.pMin)) * pw} ry={(c.ry / (SLIDER.tMax - SLIDER.tMin)) * ph}
              fill="none" stroke="#06101d" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4 4" />
            <text x={sx(m.P0) + (c.rx / (SLIDER.pMax - SLIDER.pMin)) * pw + 4} y={sy(m.t0) - 3} className="contour-l">{c.lv}%</text>
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
      <text x={sx(allowed.pMin) + 6} y={sy(allowed.tMax) + 16} className="hm-allowed">{group} 그룹 허용 범위</text>
      {/* 기존 조건 */}
      <g transform={`translate(${sx(b.P)},${sy(b.t)})`}>
        <circle r="9" fill="#D9534F" stroke="#ffffff" strokeWidth="2.5" />
        <text x="13" y="4" className="hm-tag">기존 {b.P} mTorr / {b.t} s</text>
      </g>
      {showRec && rec && (
        <g transform={`translate(${sx(rec.P)},${sy(rec.t)})`}>
          <path d="M0,-12 L3.5,-3.5 L12,0 L3.5,3.5 L0,12 L-3.5,3.5 L-12,0 L-3.5,-3.5Z" fill="#2E9E68" stroke="#ffffff" strokeWidth="2" />
          <text x="14" y="-6" className="hm-tag">AI 추천 {rec.P} mTorr / {rec.t} s</text>
        </g>
      )}
      <g transform={`translate(${sx(P)},${sy(t)})`} className="hm-cur">
        <circle r="11" fill="none" stroke="#fff" strokeWidth="2.5" />
        <circle r="3" fill="#fff" />
      </g>
      {pTicks.map((v) => (
        <g key={"p" + v}>
          <line x1={sx(v)} x2={sx(v)} y1={T + ph} y2={T + ph + 5} stroke="rgba(128,140,160,.6)" />
          <text x={sx(v)} y={T + ph + 19} textAnchor="middle" className="ax">{v}</text>
        </g>
      ))}
      {tTicks.map((v) => (
        <g key={"t" + v}>
          <line x1={L - 5} x2={L} y1={sy(v)} y2={sy(v)} stroke="rgba(128,140,160,.6)" />
          <text x={L - 9} y={sy(v) + 4} textAnchor="end" className="ax">{v}</text>
        </g>
      ))}
      <text x={L + pw / 2} y={H - 8} textAnchor="middle" className="ax-title">식각 압력 (mTorr)</text>
      <text transform={`translate(15,${T + ph / 2}) rotate(-90)`} textAnchor="middle" className="ax-title">식각 시간 (s)</text>
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
      <div className="scroll-x">
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
            return (
              <g key={k}>
                <rect x={sx(b.start)} y={T + i * rowH + 5} width={sx(b.end) - sx(b.start)} height={rowH - 10} rx="4"
                  fill={b.group === "P1" ? "#1F9C96" : "#C2477E"} stroke={late ? "#D9534F" : b.group === "P1" ? "#1F9C96" : "#C2477E"} strokeWidth={late ? 2.5 : 1.2} />
                <text x={sx(b.end) + 6} y={T + i * rowH + 19} className={"g-bar" + (late ? " late" : "")}>{(b.end / 24).toFixed(1)}일 완료{late ? " · 지연" : ""}</text>
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
```

### `src/MpwPlace.jsx`

```jsx
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
    tip.textContent = txt; tip.style.left = (e.clientX - rect.left) + "px"; tip.style.top = (e.clientY - rect.top) + "px"; tip.style.opacity = 1;
  };

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
              <div className="fx-canvas" onMouseMove={onMove} onMouseLeave={() => tipRef.current && (tipRef.current.style.opacity = 0)}>
                <canvas ref={cvRef} role="img" aria-label={`${group} 그룹 회사의 칩이 한 웨이퍼에 배치된 모습`} />
                <div className="fx-tip" ref={tipRef} />
                {done && pl.sugg.length > 0 && (
                  <div className="fx-addable">
                    <div>더 넣을 수 있는 수량</div>
                    {list.map((o) => <div key={o.id} className="row"><i style={{ "--c": chipVar(o.id) }} />{o.company} <b>+{cnt[o.id] || 0}개</b></div>)}
                  </div>
                )}
              </div>
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
```

### `src/App.jsx`

```jsx
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
        <nav aria-label="섹션 메뉴">
          {NAV.map(([id, en, ko], i) => (
            <button key={id} className={"nav-item" + (active === id ? " on" : "")} onClick={() => go(id)} aria-current={active === id ? "page" : undefined}>
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
          <div className="pipeline">
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
          <table className="tbl">
            <thead>
              <tr><th>회사</th><th>칩 종류</th><th>크기 (mm)</th><th className="r">다이 면적</th><th>주문 수량</th><th>기본 플랫폼</th><th>식각 대상</th><th>납기 (일)</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><span className="co-cell"><span className="co-badge neutral" style={{ background: `var(--chip${o.id})`, color: "#fff", borderColor: "transparent" }}>{o.id}</span>
                    <input id={`o-${o.id}-company`} className="cell-in txt sm" value={o.company} maxLength={12} disabled={busy} aria-label="회사 이름"
                      onChange={(e) => upd(o.id, "company", e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) upd(o.id, "company", o.id + "사"); }} /></span></td>
                  <td><input id={`o-${o.id}-chip`} className="cell-in txt" value={o.chip} maxLength={30} disabled={busy} aria-label="칩 종류"
                    onChange={(e) => upd(o.id, "chip", e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) upd(o.id, "chip", "칩"); }} /></td>
                  <td><span className="size">{numIn(o, "w", 0.5, 10, 0.1)}<span>×</span>{numIn(o, "h", 0.5, 10, 0.1)}</span></td>
                  <td className="r mono">{(o.w * o.h).toFixed(1)} mm²</td>
                  <td>{numIn(o, "qty", 1, 100, 1)}</td>
                  <td>
                    <select id={`o-${o.id}-platform`} className="cell-in sel" value={o.platform} disabled={busy} onChange={(e) => upd(o.id, "platform", e.target.value)}>
                      {PLATFORMS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select id={`o-${o.id}-material`} className="cell-in sel" value={o.material} disabled={busy} onChange={(e) => upd(o.id, "material", e.target.value)}>
                      {MATERIALS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                    </select>
                  </td>
                  <td>{numIn(o, "due", 1, 60)}</td>
                  <td><button className="row-del" onClick={() => removeOrder(o.id)} disabled={busy || orders.length <= 2} aria-label={`${o.company} 삭제`} title="삭제">삭제</button></td>
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
```

### `src/style.css`

```css
/* Layout: 고정 사이드 내비 + 스크롤 메인(6개 섹션), 노트북 전체화면 기준 1440px */

:root {
  color-scheme: light;
  --bg: #E8EBEE; --bg2: #EEF0F2; --panel: #F6F7F8; --panel2: #FFFFFF;
  --line: #CBD1D8; --line2: #B6BEC8; --fg: #17202A; --muted: #566170; --dim: #7A8594;
  --cyan: #B47B06; --accent: #D99A12; --accent-ink: #1B1300; --accent-soft: #F1D48D; --blue: #4351C2;
  --p1: #16837F; --p2: #B33B6E; --p1-fill: #CDE7E5; --p2-fill: #F1D6E1;
  --good: #1C744B; --bad: #C2413B; --warn: #B8790A; --bad-ink: #A1302B; --bad-soft: #F6D9D7; --good-soft: #D4EBDD;
  --track: #DCE0E5; --input-bg: #FFFFFF; --topbar-bg: rgba(232,235,238,.88); --lane-bg: rgba(246,247,248,.7);
  --chipA: #16837F; --chipB: #4351C2; --chipC: #B33B6E; --chipD: #647F18; --chipE: #C2621A; --chipF: #7A4FB3; --chipG: #2C7DA0; --chipH: #8A6D1E;
  --wafer-hi: #D7DCE3; --wafer-lo: #A9B2BE; --wafer-grid: rgba(23,32,42,.07); --teg: #8A93A0; --trad: #9AA3AE;
  --env-soft: #E2F0E8; --env-ink: #145C3A;
  --f-body: "IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
  --f-disp: "IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
  --f-mono: "IBM Plex Sans KR", ui-monospace, "SFMono-Regular", Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  color-scheme: dark;
  --bg: #0F1318; --bg2: #13181F; --panel: #161B22; --panel2: #1B212A;
  --line: #29313C; --line2: #39434F; --fg: #E4E8EE; --muted: #97A1AE; --dim: #6F7A88;
  --cyan: #F0B43A; --accent: #F0B43A; --accent-soft: #5A4512; --blue: #7582F0;
  --p1: #2BB0AB; --p2: #E0679C; --p1-fill: #123A39; --p2-fill: #3E1B2B;
  --good: #47C08A; --bad: #F0675F; --warn: #F0B43A; --bad-ink: #FF9C95; --bad-soft: #3A1F24; --good-soft: #13361F;
  --track: #222932; --input-bg: #0F1318; --topbar-bg: rgba(15,19,24,.88); --lane-bg: rgba(22,27,34,.7);
  --chipA: #2BB0AB; --chipB: #7582F0; --chipC: #E0679C; --chipD: #9CBE3B; --chipE: #F08A3E; --chipF: #A87BE0; --chipG: #4FB0D6; --chipH: #CDAE4F;
  --wafer-hi: #36404D; --wafer-lo: #222932; --wafer-grid: rgba(228,232,238,.06); --teg: #5D6672; --trad: #5E6774;
  --env-soft: #14261D; --env-ink: #6FD3A3;
} }
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0F1318; --bg2: #13181F; --panel: #161B22; --panel2: #1B212A;
  --line: #29313C; --line2: #39434F; --fg: #E4E8EE; --muted: #97A1AE; --dim: #6F7A88;
  --cyan: #F0B43A; --accent: #F0B43A; --accent-soft: #5A4512; --blue: #7582F0;
  --p1: #2BB0AB; --p2: #E0679C; --p1-fill: #123A39; --p2-fill: #3E1B2B;
  --good: #47C08A; --bad: #F0675F; --warn: #F0B43A; --bad-ink: #FF9C95; --bad-soft: #3A1F24; --good-soft: #13361F;
  --track: #222932; --input-bg: #0F1318; --topbar-bg: rgba(15,19,24,.88); --lane-bg: rgba(22,27,34,.7);
  --chipA: #2BB0AB; --chipB: #7582F0; --chipC: #E0679C; --chipD: #9CBE3B; --chipE: #F08A3E; --chipF: #A87BE0; --chipG: #4FB0D6; --chipH: #CDAE4F;
  --wafer-hi: #36404D; --wafer-lo: #222932; --wafer-grid: rgba(228,232,238,.06); --teg: #5D6672; --trad: #5E6774;
  --env-soft: #14261D; --env-ink: #6FD3A3;
}
* { box-sizing: border-box; }
html, body { background: var(--bg); color: var(--fg); }
body { font-family: var(--f-body); font-size: 15px; line-height: 1.55; }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }
button, input, select { font: inherit; color: inherit; }
.mono, .num { font-family: var(--f-mono); font-variant-numeric: tabular-nums; }
.muted { color: var(--muted); }
h2, h3 { margin: 0; text-wrap: balance; }
h3 { font-size: 15px; font-weight: 600; letter-spacing: .01em; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mt { margin-top: 18px; }
:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }

.app { display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 85% -10%, rgba(67,81,194,.10), transparent 60%),
    radial-gradient(900px 500px at 10% 110%, rgba(217,154,18,.07), transparent 60%), var(--bg); }

/* Sidebar */
.side { position: sticky; top: env(safe-area-inset-top, 0px); height: 100vh; padding: 22px 16px; border-right: 1px solid var(--line);
  background: var(--panel); display: flex; flex-direction: column; gap: 22px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); }
.brand { display: flex; gap: 12px; align-items: center; padding: 0 6px; }
.wafer { width: 40px; height: 40px; flex: none; }
.brand-name { font-family: var(--f-disp); font-weight: 600; font-size: 19px; letter-spacing: .06em; }
.brand-name b { color: var(--cyan); }
.brand-sub { font-size: 12px; color: var(--muted); }
nav { display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; gap: 12px; align-items: flex-start; text-align: left; background: none; border: 1px solid transparent; border-radius: 10px;
  padding: 10px 12px; cursor: pointer; transition: background .2s, border-color .2s; }
.nav-item:hover { background: rgba(217,154,18,.05); }
.nav-item.on { background: linear-gradient(90deg, rgba(217,154,18,.13), rgba(67,81,194,.05)); border-color: rgba(217,154,18,.28); }
.nav-i { font-family: var(--f-mono); font-size: 12px; color: var(--dim); padding-top: 2px; }
.nav-item.on .nav-i { color: var(--cyan); }
.nav-en { display: block; font-family: var(--f-disp); font-weight: 600; font-size: 14px; letter-spacing: .03em; }
.nav-txt { flex: 1; min-width: 0; }
.nav-st { width: 8px; height: 8px; border-radius: 50%; margin-top: 7px; flex: none; }
.nav-st.done { background: var(--good); box-shadow: 0 0 0 3px rgba(28,140,90,.18); }
.nav-st.run { background: var(--cyan); animation: pulse 1s infinite; }
.view { animation: viewIn .35s ease both; }
@keyframes viewIn { from { opacity: .001; transform: translateY(8px); } }
.pager { display: flex; justify-content: space-between; gap: 12px; margin-top: 28px; }
.main:has(#overview) .pager { display: none; }
.nav-ko { display: block; font-size: 12px; color: var(--muted); }
.side-note { margin-top: auto; font-size: 12px; color: var(--dim); border-top: 1px solid var(--line); padding: 14px 6px 0; }

/* Main */
.main { padding-block: 0 40px; padding-left: max(28px, env(safe-area-inset-left, 0px)); padding-right: max(28px, env(safe-area-inset-right, 0px)); min-width: 0; }
.topbar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 20; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
  padding: 14px 0; background: var(--topbar-bg); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.pipeline { display: flex; gap: 6px; flex-wrap: wrap; }
.pipe { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--dim); padding: 6px 12px; border: 1px solid var(--line); border-radius: 99px; }
.pipe-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line2); }
.pipe.run { color: var(--cyan); border-color: rgba(217,154,18,.45); }
.pipe.run .pipe-dot { background: var(--cyan); box-shadow: 0 0 0 4px rgba(217,154,18,.18); animation: pulse 1s infinite; }
.pipe.done { color: var(--fg); border-color: rgba(28,140,90,.35); }
.pipe.done .pipe-dot { background: var(--good); }
.top-actions { display: flex; gap: 10px; }
.disclaimer { margin: 18px 0 6px; font-size: 13px; color: var(--muted); background: rgba(245,165,36,.06); border: 1px solid rgba(245,165,36,.25); border-radius: 10px; padding: 10px 14px; }
.disclaimer b { color: var(--warn); margin-right: 8px; }
.disclaimer { display: none !important; }

/* Buttons */
.btn { border: 1px solid var(--line2); background: var(--panel2); border-radius: 10px; padding: 9px 16px; cursor: pointer; font-weight: 600; font-size: 14px;
  display: inline-flex; align-items: center; gap: 8px; transition: transform .15s, box-shadow .2s, background .2s; white-space: nowrap; }
.btn:hover:not(:disabled) { transform: translateY(-1px); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn.primary { background: var(--accent); border-color: transparent; color: #1B1300; font-weight: 700; box-shadow: none; }
.btn.primary:hover:not(:disabled) { box-shadow: 0 10px 28px -8px rgba(217,154,18,.8); }
.btn.big { padding: 11px 22px; font-size: 15px; }
.btn.ghost { background: transparent; }
.btn.tiny { padding: 4px 10px; font-size: 12px; }
.spin { width: 14px; height: 14px; border: 2px solid rgba(27,19,0,.25); border-top-color: #1B1300; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 50% { box-shadow: 0 0 0 7px rgba(217,154,18,0); } }

/* Sections */
.section { padding-top: 26px; scroll-margin-top: 70px; display: flex; flex-direction: column; gap: 16px; }
.sec-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.kicker { font-family: var(--f-disp); font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: var(--cyan); display: flex; gap: 10px; align-items: center; }
.kidx { font-family: var(--f-mono); color: var(--dim); letter-spacing: 0; }
.sec-head h2 { font-size: 26px; font-weight: 700; margin-top: 4px; }
.sec-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.lead { margin: 0; color: var(--muted); max-width: none; word-break: keep-all; text-align: justify; }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px; min-width: 0; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
.hint { font-size: 12.5px; color: var(--muted); font-weight: 400; margin: 8px 0 0; }
.panel-head .hint, h3 .hint { margin: 0; }
.scroll-x { overflow-x: auto; }
.fade-in { animation: fadeIn .6s ease both; }
@keyframes fadeIn { from { opacity: .001; transform: translateY(6px); } }

/* KPIs */
.kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.kpi { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
.kpi-l { font-size: 12.5px; color: var(--muted); }
.kpi-v { font-family: var(--f-disp); font-size: 30px; font-weight: 600; line-height: 1.2; }
.kpi-v .num { font-family: var(--f-disp); }
.kpi-v small { font-size: 14px; color: var(--muted); margin-left: 4px; font-family: var(--f-body); }

/* Table */
.tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
.tbl th { text-align: left; font-weight: 500; color: var(--muted); font-size: 12.5px; padding: 8px 7px; border-bottom: 1px solid var(--line); white-space: nowrap; }
.tbl td { padding: 8px 7px; border-bottom: 1px solid var(--line); white-space: nowrap; }
.tbl tr:last-child td { border-bottom: 0; }
.tbl .r { text-align: right; }
.tbl td.hl { color: var(--cyan); font-weight: 600; }
.tbl .pos { color: var(--good); }
.cell-in { width: 64px; background: var(--input-bg); border: 1px solid var(--line2); border-radius: 7px; padding: 5px 8px; font-family: var(--f-mono); font-size: 13.5px; }
.cell-in:focus { border-color: var(--cyan); outline: none; }
.size { display: inline-flex; align-items: center; gap: 4px; color: var(--muted); }
.size .cell-in { width: 54px; }
select.cell-in { width: 100px; font-weight: 600; }
select.grp.P1 { color: var(--p1); } select.grp.P2 { color: var(--p2); }
.co-badge { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 6px; font-family: var(--f-mono); font-weight: 700; font-size: 12.5px; margin-right: 8px;
  background: var(--input-bg); color: var(--fg); }
.co-badge.P1 { background: rgba(217,154,18,.16); color: var(--p1); }
.co-badge.P2 { background: rgba(179,59,110,.18); color: var(--p2); }
.tag { display: inline-flex; align-items: center; font-family: var(--f-mono); font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; border: 1px solid; white-space: nowrap; }
.tag.P1 { color: var(--p1); border-color: rgba(217,154,18,.4); background: rgba(217,154,18,.08); }
.tag.P2 { color: var(--p2); border-color: rgba(179,59,110,.45); background: rgba(179,59,110,.09); }
.tag.neutral { color: var(--muted); border-color: var(--line2); }
.tag.bad { color: var(--bad); border-color: rgba(240,82,90,.45); }
.tag.warnc { color: var(--warn); border-color: rgba(245,165,36,.45); }
.tag.ok { color: var(--good); border-color: rgba(28,140,90,.4); }
.tag.sm { font-size: 11px; padding: 1px 6px; margin-left: auto; }

.grp-defs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grp-def { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: var(--bg2); }
.grp-def.P1 { border-color: rgba(217,154,18,.22); } .grp-def.P2 { border-color: rgba(179,59,110,.25); }
.grp-def-h { display: flex; gap: 10px; align-items: center; font-weight: 600; margin-bottom: 8px; }
.grp-def dl { display: grid; grid-template-columns: 120px 1fr; gap: 4px 12px; margin: 0; font-size: 13.5px; }
.grp-def dt { color: var(--muted); } .grp-def dd { margin: 0; }

/* Compat */
.compat-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; }
.steps ol { list-style: none; padding: 0; margin: 12px 0; display: flex; flex-direction: column; gap: 8px; }
.steps li { display: flex; gap: 10px; align-items: center; font-size: 14px; color: var(--dim); }
.steps li.run { color: var(--cyan); } .steps li.done { color: var(--fg); }
.st-dot { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 11.5px; font-family: var(--f-mono); border: 1px solid var(--line2); flex: none; }
.steps li.run .st-dot { border-color: var(--cyan); animation: pulse 1s infinite; box-shadow: 0 0 0 3px rgba(217,154,18,.2); }
.steps li.done .st-dot { background: var(--good); border-color: var(--good); color: #fff; font-weight: 700; }
.progress { position: relative; height: 8px; border-radius: 99px; background: var(--track); overflow: hidden; margin-top: 4px; }
.progress-bar { height: 100%; background: linear-gradient(90deg, var(--cyan), var(--blue)); transition: width .15s linear; }
.progress-label { display: block; font-family: var(--f-mono); font-size: 12px; color: var(--cyan); margin-top: 6px; }
.lanes { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.lane { border: 1px dashed var(--line2); border-radius: 14px; padding: 14px; background: var(--lane-bg); }
.lane.P1 { border: 1px solid rgba(217,154,18,.35); background: linear-gradient(180deg, rgba(217,154,18,.06), var(--lane-bg)); }
.lane.P2 { border: 1px solid rgba(179,59,110,.38); background: linear-gradient(180deg, rgba(179,59,110,.07), var(--lane-bg)); }
.lane-h { display: flex; gap: 10px; align-items: center; font-weight: 600; margin-bottom: 12px; flex-wrap: wrap; }
.lane-meta { margin-left: auto; font-size: 12px; color: var(--muted); font-weight: 400; }
.lane-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 10px; }
.ocard { background: var(--panel2); border: 1px solid var(--line2); border-radius: 11px; padding: 11px 13px; position: relative; will-change: transform; }
.ocard.P1 { border-color: rgba(217,154,18,.45); } .ocard.P2 { border-color: rgba(179,59,110,.5); }
.ocard.scanning { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(217,154,18,.25), 0 0 24px rgba(217,154,18,.25); }
.ocard.scanning::after { content: ""; position: absolute; inset: 0; border-radius: 11px; background: linear-gradient(180deg, transparent, rgba(217,154,18,.18), transparent); animation: scan .5s linear infinite; }
@keyframes scan { from { transform: translateY(-40%); } to { transform: translateY(40%); } }
.ocard-top { display: flex; align-items: center; gap: 2px; }
.ocard-chip { font-size: 13px; color: var(--muted); margin-top: 4px; }
.ocard-meta { font-size: 12px; color: var(--dim); margin-top: 2px; }
.result { border-color: rgba(28,140,90,.3); }
.result-h { display: flex; align-items: center; gap: 10px; font-family: var(--f-disp); font-size: 18px; font-weight: 600; color: var(--good); margin-bottom: 8px; }
.ok-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--good); box-shadow: 0 0 0 4px rgba(28,140,90,.2); }
.result-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
.result-list li { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
.result-list li.warn { color: var(--bad-ink); }
.warn-inline { color: var(--warn); font-size: 13px; }

/* Recipe */
.tabs { display: flex; gap: 6px; background: var(--bg2); border: 1px solid var(--line); border-radius: 12px; padding: 4px; flex-wrap: wrap; }
.tab { background: none; border: 0; padding: 8px 14px; border-radius: 9px; cursor: pointer; font-size: 13.5px; color: var(--muted); display: flex; gap: 8px; align-items: center; }
.tab.on.P1 { background: rgba(217,154,18,.14); color: var(--p1); }
.tab.on.P2 { background: rgba(179,59,110,.16); color: var(--p2); }
.tab-n { font-family: var(--f-mono); font-size: 11.5px; opacity: .8; }
.recipe-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 14px; }
.yield-panel { display: flex; flex-direction: column; gap: 18px; }
.yb-l { font-size: 13.5px; color: var(--muted); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.model-tag { font-size: 11.5px; color: var(--warn); border: 1px solid rgba(245,165,36,.35); border-radius: 6px; padding: 1px 7px; }
.yb-v { font-family: var(--f-disp); font-size: 84px; font-weight: 600; line-height: 1; margin: 8px 0 10px; color: var(--fg); transition: color .3s; }
.yb-v .num { font-family: var(--f-disp); }
.yb-v small { font-size: 34px; color: var(--muted); margin-left: 4px; }
.yb-v.good { color: var(--good); text-shadow: 0 0 30px rgba(28,140,90,.35); }
.yb-v.bad { color: var(--bad-ink); }
.yb-deltas { display: flex; gap: 18px; flex-wrap: wrap; font-size: 13.5px; color: var(--muted); }
.yb-deltas b { font-family: var(--f-mono); margin-left: 6px; }
.pos { color: var(--good); } .neg { color: var(--bad); }
.warn-box { margin-top: 12px; font-size: 13px; color: var(--bad-ink); background: rgba(240,82,90,.08); border: 1px solid rgba(240,82,90,.35); border-radius: 9px; padding: 8px 12px; }
.controls { display: flex; flex-direction: column; gap: 16px; }
.controls.compact { flex-direction: row; gap: 24px; flex: 1; flex-wrap: wrap; }
.controls.compact .slider { flex: 1; min-width: 220px; }
.slider-h { display: flex; justify-content: space-between; align-items: baseline; }
.slider-h label { font-weight: 600; font-size: 14px; }
.slider-v { font-size: 20px; font-weight: 600; color: var(--cyan); }
.slider-v small { font-size: 12px; color: var(--muted); }
.slider-v.out { color: var(--bad); }
.slider-scale { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--dim); margin-top: 2px; }
.allowed-l { color: var(--cyan); }
input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 99px; margin: 10px 0 4px; cursor: pointer; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 4px solid var(--cyan); box-shadow: 0 0 0 5px rgba(217,154,18,.18), 0 2px 8px rgba(0,0,0,.5); }
input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 4px solid var(--cyan); }
input[type=range]:disabled { cursor: progress; }
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.recipe-side { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.recipe-grid { align-items: stretch; }
.recipe-side > :last-child { flex: 1 1 auto; }
.cmp2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cmp-card { border-radius: 14px; padding: 14px 16px; border: 1px solid var(--line); background: var(--panel); }
.cmp-card.base { border-color: rgba(240,82,90,.35); background: linear-gradient(180deg, rgba(240,82,90,.07), var(--panel)); }
.cmp-card.ai { border-color: rgba(28,140,90,.45); background: linear-gradient(180deg, rgba(28,140,90,.09), var(--panel)); }
.cmp-card.ai.pending { border-style: dashed; border-color: var(--line2); background: var(--panel); }
.cmp-h { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--muted); }
.cmp-card.base .cmp-h { color: var(--bad-ink); } .cmp-card.ai .cmp-h { color: var(--good); }
.cmp-row { display: flex; justify-content: space-between; font-size: 13.5px; padding: 3px 0; }
.cmp-row span { color: var(--muted); }
.cmp-row.big b { font-size: 22px; }
.cmp-empty { font-size: 13px; color: var(--dim); padding: 6px 0; }
.gain-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gain-v { font-family: var(--f-disp); font-size: 30px; font-weight: 600; color: var(--good); line-height: 1.15; }
.gain-v .num { font-family: var(--f-disp); }
.gain-l { font-size: 12.5px; color: var(--muted); }
.ai-msg { font-size: 14px; margin: 14px 0 0; padding: 12px 14px; border-radius: 10px; background: rgba(217,154,18,.06); border: 1px solid rgba(217,154,18,.22); }
.ai-msg b { color: var(--cyan); }
.al-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }
.al-f { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 13.5px; color: var(--muted); }
.al-in { display: inline-flex; align-items: center; gap: 6px; }
.al-in input { width: 110px; background: var(--input-bg); border: 1px solid var(--line2); border-radius: 7px; padding: 5px 8px; font-family: var(--f-mono); font-size: 13.5px; color: var(--fg); text-align: right; }
.al-in small { color: var(--dim); width: 44px; min-width: 44px; flex: none; font-size: 12.5px; }
.al-f > span:first-child { white-space: nowrap; }
.al-in input { width: 100px; }
.al-grid:has(#c-etch) { grid-template-columns: minmax(0, 1fr); gap: 10px; }
.al-grid:has(#c-etch) .al-f > span:first-child { white-space: nowrap; font-size: 13.5px; }
.al-grid:has(#c-etch) .al-in input { width: 140px; }

/* Yield sim */
.ysim-bar { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; position: sticky; top: calc(env(safe-area-inset-top, 0px) + 64px); z-index: 5; background: var(--topbar-bg); backdrop-filter: blur(8px); }
.ysim-now { text-align: right; }
.ysim-now > span { display: block; font-size: 12.5px; color: var(--muted); }
.ysim-now b { font-size: 36px; color: var(--good); font-family: var(--f-disp); }
.ysim-now b .num { font-family: var(--f-disp); }
.yield-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 14px; }
.heatmap { width: 100%; height: auto; display: block; cursor: crosshair; touch-action: none; }
.heatmap .ax { fill: var(--muted); font-family: var(--f-mono); font-size: 12px; }
.heatmap .ax-title { fill: var(--muted); font-size: 13px; }
.heatmap .hm-tag { fill: #fff; font-size: 12.5px; font-weight: 600; paint-order: stroke; stroke: #050a14; stroke-width: 4px; }
.heatmap .hm-allowed { fill: #e6f7ff; font-size: 12px; paint-order: stroke; stroke: #050a14; stroke-width: 3px; }
.heatmap .contour-l { fill: #06101d; font-size: 11px; font-family: var(--f-mono); font-weight: 700; }
.hm-cur { transition: transform .08s linear; filter: drop-shadow(0 0 6px rgba(255,255,255,.6)); }
.curves { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.yield-grid { align-items: stretch; }
.yield-grid .heat { display: flex; flex-direction: column; justify-content: center; }
.yield-grid .heat .heatmap { width: min(100%, calc((100vh - 400px) * 1.3617)); margin: 0 auto; }
.curves > .panel { flex: 1 1 0; display: flex; flex-direction: column; justify-content: center; }
.curves > .panel .panel-head { margin-bottom: 4px; }
.curves > .hint { display: none; }
.legend { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12.5px; color: var(--muted); margin-top: 10px; }
.legend-bar { width: 160px; height: 10px; border-radius: 99px; }
.lg-i { display: inline-flex; gap: 6px; align-items: center; }
.lg-i i { display: inline-block; }
.dot { width: 11px; height: 11px; border-radius: 50%; }
.dot.red { background: var(--bad); } .dot.green { background: var(--good); } .dot.ring { border: 2px solid var(--fg); }
.hatch { width: 16px; height: 11px; border-radius: 2px; background: repeating-linear-gradient(45deg, var(--line) 0 3px, var(--line2) 3px 5px); }
.hatch.red { background: repeating-linear-gradient(45deg, var(--bad-soft) 0 3px, var(--bad) 3px 5px); }
.sw { width: 16px; height: 11px; border-radius: 3px; }
.sw.p1 { background: var(--p1-fill); border: 1px solid var(--p1); } .sw.p2 { background: var(--p2-fill); border: 1px solid var(--p2); }
.sw.late { border: 2px solid var(--bad); }
.due { width: 3px; height: 14px; background: var(--warn); }
.curve-read { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; color: var(--fg); margin-top: 2px; }
.curve-read span { display: inline-flex; align-items: center; gap: 6px; }
.curve-read .dot { width: 9px; height: 9px; }
.tip { background: var(--panel2); border: 1px solid var(--line2); border-radius: 8px; padding: 6px 10px; font-family: var(--f-mono); font-size: 12px; color: var(--muted); }
.tip b { color: var(--fg); font-size: 14px; }

/* Scheduler */
.sched-top { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 14px; }
.seq { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 10px; }
.seq-chip { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 9px; font-weight: 600; font-size: 14px; border: 1px solid; }
.seq-chip.P1 { color: var(--p1); border-color: rgba(217,154,18,.4); background: rgba(217,154,18,.08); }
.seq-chip.P2 { color: var(--p2); border-color: rgba(179,59,110,.45); background: rgba(179,59,110,.09); }
.seq-chip button { background: none; border: 0; cursor: pointer; color: var(--muted); padding: 0 4px; font-size: 16px; line-height: 1; }
.seq-chip button:disabled { opacity: .25; cursor: default; }
.seq-arrow { color: var(--dim); font-family: var(--f-mono); }
.seq-arrow.switch { color: var(--bad); font-weight: 700; }
.params { display: flex; flex-direction: column; gap: 10px; }
.sched-stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.stat { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
.stat.hl { border-color: rgba(28,140,90,.45); background: linear-gradient(180deg, rgba(28,140,90,.10), var(--panel)); }
.stat-l { font-size: 12.5px; color: var(--muted); }
.stat-v { font-family: var(--f-mono); font-size: 20px; font-weight: 600; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.stat.hl .stat-v { color: var(--good); font-size: 24px; }
.stat-v .old { color: var(--dim); font-size: 15px; text-decoration: line-through; }
.stat-v small { font-size: 13px; }
.gantt-wrap + .gantt-wrap { margin-top: 18px; }
.gantt-title { display: flex; gap: 10px; align-items: center; font-weight: 600; font-size: 14px; margin-bottom: 6px; }
.gantt-title span { width: 10px; height: 10px; border-radius: 3px; }
.gantt { width: 100%; min-width: 720px; height: auto; display: block; }
.gantt .ax { fill: var(--dim); font-family: var(--f-mono); font-size: 11.5px; }
.gantt .g-label { fill: var(--fg); font-size: 13px; font-weight: 600; }
.gantt .g-label.muted { fill: var(--muted); font-weight: 400; }
.gantt .g-grp { font-family: var(--f-mono); font-size: 12px; font-weight: 700; }
.gantt .g-grp.P1 { fill: var(--p1); } .gantt .g-grp.P2 { fill: var(--p2); }
.gantt .g-bar.late { fill: var(--bad-ink); }
.gantt .g-bar { fill: var(--muted); font-size: 11.5px; font-family: var(--f-mono); }

/* Impact */
.complete { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; font-family: var(--f-disp); font-size: 28px; font-weight: 600; letter-spacing: .03em; color: var(--good);
  padding: 18px 22px; border-radius: 14px; border: 1px solid rgba(28,140,90,.4); background: linear-gradient(90deg, rgba(28,140,90,.12), rgba(217,154,18,.06)); }
.complete-sub { font-family: var(--f-body); font-size: 14px; color: var(--muted); letter-spacing: 0; font-weight: 400; }
.callout { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; border-style: dashed; }
.callout p { margin: 0; color: var(--muted); }
.impact-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.impact-cards .icard.hero { grid-column: span 2; }
.icard.hero.p2 { border-color: rgba(179,59,110,.5); background: radial-gradient(400px 200px at 0% 0%, rgba(179,59,110,.18), transparent 70%), var(--panel); }
.icard.hero.p2 .icard-v { color: var(--p2); }
.icard { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.icard.hero { border-color: rgba(217,154,18,.45); background: radial-gradient(400px 200px at 0% 0%, rgba(217,154,18,.16), transparent 70%), var(--panel); }
.icard-l { font-size: 13px; color: var(--muted); }
.icard-v { font-family: var(--f-disp); font-size: 40px; font-weight: 600; color: var(--good); line-height: 1.1; overflow-wrap: anywhere; }
.icard-v .num { font-family: var(--f-disp); }
.icard.hero .icard-v { font-size: 60px; color: var(--cyan); }
.icard-v small { font-size: 18px; margin-left: 3px; color: var(--muted); }
.icard-v.sm { font-size: 26px; }
.icard-s { font-size: 12.5px; color: var(--muted); margin-top: auto; }
.icard-s b { color: var(--fg); }
.impact-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
.tbl.cmp td { font-size: 14.5px; padding: 10px; }
.split2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 10px 0; }
.split2 > div { border: 1px solid var(--line); border-radius: 10px; padding: 12px; background: var(--bg2); }
.split-l { font-size: 12.5px; color: var(--muted); }
.split-v { font-size: 24px; font-weight: 600; color: var(--cyan); }
.count-ctl { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
.count-ctl b { font-size: 16px; color: var(--fg); min-width: 18px; text-align: center; }
.count-ctl .btn.tiny { padding: 2px 10px; font-size: 16px; }
.count-ctl small { color: var(--dim); }
.co-cell { display: inline-flex; align-items: center; }
.cell-in.txt { width: 150px; font-family: var(--f-body); }
.cell-in.txt.sm { width: 72px; font-weight: 600; }
.row-del { background: rgba(240,82,90,.06); border: 1px solid rgba(240,82,90,.35); color: var(--bad-ink); font-size: 12.5px; font-weight: 600; padding: 4px 10px; border-radius: 7px; cursor: pointer; }
.row-del:hover:not(:disabled) { background: rgba(240,82,90,.16); color: var(--bad); }
.row-del:disabled { opacity: .3; cursor: not-allowed; }
.row-actions { display: none !important; }
.row-actions .hint { margin: 0; }
.add-row { border-style: dashed; }
.del-row { display: none !important; }
.stat-sub { font-size: 12px; color: var(--muted); font-family: var(--f-mono); }
.tb { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.tb-row { display: grid; grid-template-columns: 44px minmax(0, 1fr) 190px; gap: 12px; align-items: center; }
.tb-l { font-size: 13px; color: var(--muted); }
.tb-bar { display: flex; height: 26px; border-radius: 6px; overflow: hidden; background: var(--track); }
.tb-proc { background: var(--line); display: flex; align-items: center; padding-left: 10px; font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; }
.tb-chg.old { background: repeating-linear-gradient(45deg, var(--bad-soft) 0 4px, var(--bad) 4px 7px); }
.tb-chg.new { background: repeating-linear-gradient(45deg, var(--good-soft) 0 4px, var(--good) 4px 7px); }
.tb-v { font-size: 12.5px; color: var(--fg); }
@media (max-width: 860px) { .tb-row { grid-template-columns: 36px minmax(0, 1fr); } .tb-v { grid-column: 2; } }
.kpi-wait { font-size: 18px; color: var(--muted); font-family: var(--f-body); }
.cell-in.sel { width: 160px; font-family: var(--f-body); font-size: 12.5px; padding: 5px 6px; }
.next-step, .need { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.next-step p, .need p { margin: 0; color: var(--muted); }
.need { border-color: rgba(245,165,36,.4); background: rgba(245,165,36,.05); }
.need b { color: var(--warn); }
.ocard-proc { font-size: 11.5px; color: var(--muted); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lane.held { border: 1px solid rgba(240,82,90,.4); background: rgba(240,82,90,.05); }
.foot { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--dim); font-size: 12.5px; }

/* 주문 목록: 가로 스크롤 없이 한 화면에 */
@media (min-width: 861px) {
  #overview .scroll-x { overflow-x: visible; }
  #overview .tbl { table-layout: fixed; }
  #overview .tbl th, #overview .tbl td { white-space: normal; padding: 8px 4px; }
  #overview .tbl th:nth-child(1) { width: 11%; }
  #overview .tbl th:nth-child(2) { width: 15%; }
  #overview .tbl th:nth-child(3) { width: 13%; }
  #overview .tbl th:nth-child(4) { width: 9%; }
  #overview .tbl th:nth-child(5) { width: 8%; }
  #overview .tbl th:nth-child(6) { width: 15%; }
  #overview .tbl th:nth-child(7) { width: 15%; }
  #overview .tbl th:nth-child(8) { width: 7%; }
  #overview .tbl th:nth-child(9) { width: 7%; }
  #overview .tbl .cell-in, #overview .tbl .cell-in.txt, #overview .tbl .cell-in.sel { width: 100%; min-width: 0; padding-left: 5px; padding-right: 4px; }
  #overview .tbl .co-cell, #overview .tbl .size { display: flex; width: 100%; }
  #overview .tbl .co-badge { flex: none; margin-right: 5px; }
  #overview .tbl .size .cell-in { width: auto; flex: 1 1 0; }
  #overview .tbl .row-del { padding: 4px 6px; }
}
/* Responsive */
@media (max-width: 1280px) {
  .impact-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .impact-cards .icard.hero { grid-column: span 1; }
  .sched-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .recipe-grid, .yield-grid, .impact-grid, .sched-top, .compat-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 860px) {
  .app { grid-template-columns: minmax(0, 1fr); }
  .side { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--line); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  nav { flex-direction: row; overflow-x: auto; }
  .nav-item { flex: none; }
  .nav-ko, .side-note { display: none; }
  .main { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grp-defs, .cmp2, .split2, .al-grid { grid-template-columns: minmax(0, 1fr); }
  .gain-row { grid-template-columns: minmax(0, 1fr); }
  .impact-cards, .sched-stats { grid-template-columns: minmax(0, 1fr); }
  .impact-cards .icard.hero { grid-column: auto; }
  .yb-v { font-size: 64px; }
  .ysim-bar { position: static; }
  .topbar { position: static; }
  .grp-def dl { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

/* ───────── FabShare 톤 보정 ───────── */
.app { background: var(--bg); }
.brand-name b { color: var(--cyan); }
.panel { box-shadow: none; }
.nav-item.on { background: var(--panel2); border-color: var(--line); box-shadow: inset 3px 0 0 var(--accent); }
.nav-item:hover { background: var(--bg2); }
.kicker, .kidx { color: var(--cyan); }
.g-ink.P1 { color: var(--p1); } .g-ink.P2 { color: var(--p2); }

/* ───────── 03 MPW AI Placement (FabShare) ───────── */
.fx-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.fx-lead { margin: 0 0 14px; color: var(--muted); max-width: 70em; }
.fx-lead b { color: var(--fg); }
.fx-orders { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-bottom: 16px; }
.fx-order { background: var(--panel); border: 1px solid var(--line); border-left: 5px solid var(--c); border-radius: 10px; padding: 14px 16px 12px; }
.fx-co { font-size: 13px; color: var(--muted); display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.fx-name { font-weight: 700; font-size: 16px; margin: 4px 0 10px; letter-spacing: -.01em; }
.fx-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
.fx-die { display: inline-grid; gap: 2px; vertical-align: middle; margin-right: 6px; }
.fx-die i { width: 7px; height: 7px; background: var(--c); border-radius: 1.5px; }
.fx-qty { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: var(--bg); }
.fx-qty button { width: 30px; height: 32px; border: 0; background: none; cursor: pointer; font-size: 16px; }
.fx-qty button:hover:not(:disabled) { background: var(--line); }
.fx-qty input { width: 52px; height: 32px; border: 0; text-align: center; background: none; font-weight: 700; -moz-appearance: textfield; }
.fx-qty input::-webkit-inner-spin-button { -webkit-appearance: none; }

.fx-stage { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 18px; align-items: stretch; }
.fx-wafer { display: flex; flex-direction: column; }
.fx-whead { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.fx-seg { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.fx-seg button { border: 0; background: none; padding: 7px 14px; font-size: 14px; cursor: pointer; color: var(--muted); }
.fx-seg button[aria-pressed="true"] { background: var(--fg); color: var(--panel); font-weight: 500; }
.fx-wview { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.fx-canvas { position: relative; width: 100%; max-width: 560px; margin: 0 auto; aspect-ratio: 1/1; }
.fx-canvas canvas { width: 100%; height: 100%; display: block; }
.fx-tip { position: absolute; pointer-events: none; background: var(--fg); color: var(--panel); font-size: 12.5px; padding: 6px 9px; border-radius: 6px; white-space: nowrap; transform: translate(-50%, -120%); opacity: 0; transition: opacity .1s; }
.fx-addable { position: absolute; right: 0; bottom: 0; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 6px 9px; font-size: 11.5px; line-height: 1.5; color: var(--muted); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.fx-addable b { color: var(--fg); font-weight: 500; }
.fx-addable .row { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.fx-addable i { width: 8px; height: 8px; border-radius: 2px; background: var(--c); flex: none; }
.fx-status { font-size: 13.5px; color: var(--muted); text-align: center; min-height: 22px; margin: 6px 0 10px; }
.fx-status b { color: var(--fg); }
.fx-toggle { font-size: 12.5px; border: 1px solid var(--accent); border-radius: 999px; padding: 2px 10px; background: var(--accent); color: #1B1300; font-weight: 600; cursor: pointer; margin-left: 4px; }
.fx-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; justify-content: center; border-top: 1px solid var(--line); padding-top: 12px; margin-top: auto; }
.fx-legend span { display: inline-flex; align-items: center; gap: 6px; }
.fx-sw { width: 12px; height: 12px; border-radius: 3px; background: var(--c); display: inline-block; }
.fx-sw.spare { background: repeating-linear-gradient(135deg, var(--c) 0 2px, transparent 2px 4px); border: 1px solid var(--c); }
.fx-sw.teg { background: var(--teg); }
.fx-blocks { flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 14px; align-items: end; align-content: center; padding: 10px 0; }
.fx-blk { text-align: center; }
.fx-blk svg { display: block; margin: 0 auto; max-width: 100%; height: auto; }
.fx-blk p { margin: 6px 0 0; font-size: 12.5px; color: var(--muted); line-height: 1.45; }
.fx-blk p b { color: var(--fg); } .fx-blk.ai p b { color: var(--good); }
.fx-cap { grid-column: 1 / -1; font-size: 13px; color: var(--muted); margin: 2px 0 4px; }

.fx-effects h3 { font-size: 16px; }
.fx-basis { font-size: 12.5px; color: var(--muted); margin: 4px 0 8px; }
.fx-metric { padding: 14px 0; border-top: 1px solid var(--line); }
.fx-mhead { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.fx-mname { font-size: 14.5px; font-weight: 500; }
.fx-big { font-size: clamp(24px, 2.6vw, 32px); font-weight: 700; letter-spacing: -.02em; line-height: 1.1; color: var(--good); }
.fx-big .num { font-family: var(--f-body); }
.idle .fx-big { color: var(--muted); }
.fx-line { font-size: 14px; color: var(--muted); margin: 6px 0 0; }
.fx-line b { color: var(--fg); font-weight: 500; }
.fx-bars { display: grid; gap: 6px; margin-top: 10px; }
.fx-bar { display: grid; grid-template-columns: 72px 1fr 52px; align-items: center; gap: 8px; font-size: 13px; }
.fx-track { height: 22px; background: var(--bg); border-radius: 6px; overflow: hidden; }
.fx-fill { height: 100%; width: 0; border-radius: 6px; display: flex; align-items: center; overflow: hidden; transition: width .9s cubic-bezier(.2,.8,.2,1); }
.fx-fill em { font-style: normal; font-size: 11.5px; padding: 0 8px; white-space: nowrap; }
.fx-bar.t .fx-fill { background: var(--trad); } .fx-bar.t .fx-fill em { color: #fff; }
.fx-bar.m .fx-fill { background: var(--accent); } .fx-bar.m .fx-fill em { color: #1B1300; }
.fx-v { text-align: right; font-weight: 500; }
.fx-note { margin: 6px 0 0; font-size: 12.5px; color: var(--muted); }
.fx-chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.fx-chips div { background: var(--bg); border-radius: 8px; padding: 8px 10px; font-size: 12.5px; color: var(--muted); line-height: 1.4; }
.fx-chips b { display: block; font-size: 15px; color: var(--fg); }
.fx-env { margin: 6px 0 2px; background: var(--env-soft); border-radius: 12px; padding: 14px 16px 12px; color: var(--env-ink); }
.fx-env-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.fx-env .fx-seg { border-color: currentColor; }
.fx-env .fx-seg button { color: inherit; padding: 5px 11px; font-size: 13px; }
.fx-env .fx-seg button[aria-pressed="true"] { background: var(--env-ink); color: var(--env-soft); }
.fx-env-nums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
.fx-env-nums div { font-size: 12.5px; line-height: 1.35; }
.fx-env-nums b { display: block; font-size: clamp(20px, 2.3vw, 28px); letter-spacing: -.02em; line-height: 1.15; color: var(--fg); }
.fx-env-eq { margin: 10px 0 0; font-size: 13px; line-height: 1.5; }
.fx-env-src { margin: 8px 0 0; padding-top: 8px; border-top: 1px solid currentColor; font-size: 12px; line-height: 1.5; opacity: .85; }
.fx-env-src a { color: inherit; }

.fx-sum { margin-top: 18px; }
.fx-sum-h { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; margin-bottom: 12px; }
.fx-sum-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.fx-sum-c { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; display: grid; gap: 6px; font-size: 13.5px; background: var(--panel2); }
.fx-sum-c.P1 { border-left: 4px solid var(--p1); } .fx-sum-c.P2 { border-left: 4px solid var(--p2); }
.fx-sum-c.tot { border-left: 4px solid var(--accent); }
.fx-sum-c b { color: var(--good); }
.fx-sum-big { font-size: 26px; font-weight: 700; color: var(--good); letter-spacing: -.02em; }

.fx-sched { padding: 20px 22px; }
.fx-shero { display: flex; align-items: center; gap: 12px 24px; flex-wrap: wrap; margin-bottom: 18px; }
.fx-sbig { font-size: clamp(32px, 4.4vw, 50px); font-weight: 700; letter-spacing: -.03em; line-height: 1; color: var(--good); white-space: nowrap; }
.fx-shero p { margin: 0; color: var(--muted); flex: 1 1 320px; max-width: 44em; line-height: 1.6; padding-left: 24px; border-left: 3px solid var(--good); }
.fx-shero p b { color: var(--fg); }
.fx-gantt { display: grid; grid-template-columns: 120px 1fr; gap: 12px 14px; align-items: center; }
.fx-glabel { font-size: 14px; font-weight: 500; }
.fx-glabel small { display: block; font-weight: 400; color: var(--muted); font-size: 12.5px; }
.fx-gtrack { height: 44px; background: var(--bg); border-radius: 8px; display: flex; overflow: hidden; }
.fx-gseg { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; white-space: nowrap; overflow: hidden; border-right: 2px solid var(--panel); padding: 0 4px; color: #fff; }
.fx-gseg.prep { background: #7C8797; }
.fx-gseg.prep.ai { background: var(--accent); color: #1B1300; font-size: 11px; font-weight: 700; padding: 0 2px; }
.fx-gseg.wait { background: repeating-linear-gradient(135deg, var(--trad) 0 6px, transparent 6px 10px); color: var(--fg); }
.fx-gseg.fab { background: #3E4D61; }
.fx-gaxis { grid-column: 2; display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
.fx-gkey { grid-column: 2; margin: 2px 0 0; font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
.fx-gkey i { flex: none; width: 14px; height: 14px; border-radius: 3px; background: var(--accent); }

.fx-tblp { padding: 6px 10px 10px; }
.fx-tbl td, .fx-tbl th { padding: 9px 10px; }
.fx-tbl tfoot td { font-weight: 700; border-bottom: 0; }
.fx-save { color: var(--good); font-weight: 600; }
.fx-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--c); margin-right: 6px; }

.fx-assume { margin: 22px 0 6px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }
.fx-assume summary { cursor: pointer; padding: 14px 18px; font-weight: 500; }
.fx-params { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px 20px; padding: 4px 18px 16px; }
.fx-params label { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 13.5px; color: var(--muted); }
.fx-params input { width: 96px; padding: 6px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--bg); text-align: right; }
.fx-fine { padding: 0 18px 12px; margin: 0; font-size: 12.5px; color: var(--muted); }
.fx-sources { padding: 4px 18px 18px 36px; margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.6; }
.fx-sources a { color: inherit; }

@media (max-width: 1100px) { .fx-stage { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .fx-gantt { grid-template-columns: 1fr; } .fx-gaxis, .fx-gkey { grid-column: 1; } .fx-chips { grid-template-columns: 1fr 1fr; } }
@media (prefers-reduced-motion: reduce) { .fx-fill { transition: none; } }
```

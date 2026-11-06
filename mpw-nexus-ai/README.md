# MPW NEXUS AI × FabShare

AX Challenge 발표용 **AI 기반 MPW 공정 호환성 분류 · MPW 공동 집적 · 수율 최적화 시뮬레이터**입니다.
React 18 + Recharts로 만들고, esbuild로 묶어 HTML 파일 하나(`dist/standalone.html`)로 빌드합니다.

> 교육·발표용 시뮬레이터입니다. 수율은 가상 공정 모델 계산값이며, MPW 가격은 Europractice 2026 X-FAB XP018 공시가,
> 샘플 기간은 X-FAB 2026 일정, 환율은 2026년 11월 5일 하나은행 매매기준율(1,506원/€) 기준이고 나머지는 가정치입니다.

## 화면 구성

| 화면 | 내용 |
|---|---|
| 01 Overview | 주문 목록 편집, 회사 2~8개 추가·삭제 |
| 02 Compatibility AI | 플랫폼·식각 재료 기준 P1 / P2 / 배정 보류 판정 |
| 03 MPW AI Placement | 같은 그룹 칩만 한 MPW 블록으로 웨이퍼에 AI 배치, 비용·면적·환경 효과 |
| 04 Recipe Optimizer | 압력·시간 레시피 전수 탐색 |
| 05 Yield Simulator | 단면 곡선과 2차원 수율 히트맵 |
| 06 Production Scheduler | 생산 순서 전수 탐색, 간트 차트 |
| 07 AI Impact Report | 개선 효과 종합 |

## GitHub Pages로 웹사이트 게시하기

이 폴더에는 GitHub가 자동으로 빌드·게시하는 설정(`.github/workflows/deploy.yml`)이 들어 있어서,
**내 PC에 Node.js나 Python을 설치하지 않아도** 됩니다.

1. GitHub에서 새 저장소를 만듭니다 (예: `mpw-nexus-ai`).
2. 이 폴더 **안의 내용 전체**를 저장소 최상위에 올립니다. `.github` 폴더도 꼭 함께 올려야 합니다.
   - git 없이 올릴 때: 저장소 화면의 **Add file → Upload files**에 폴더 내용을 끌어다 놓고 Commit
3. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
4. **Actions** 탭에서 "Deploy to GitHub Pages"가 초록색으로 끝나면 `https://<아이디>.github.io/<저장소 이름>/`에서 열립니다.
   (Source를 바꾸기 전에 올렸다면 Actions 탭에서 해당 작업을 **Re-run** 하세요.)

이후 `main` 브랜치에 수정 사항을 올릴 때마다 자동으로 다시 게시됩니다.

## 내 PC에서 직접 빌드하기 (선택)

Node.js 18 이상과 Python 3가 필요합니다.

```bash
npm install
python build.py
```

`dist/standalone.html`을 브라우저에서 열면 됩니다(서버 불필요). `dist/mpw-nexus-ai.html`은 claude.ai 아티팩트로 게시할 때 쓰는 본문 조각입니다.

## 폴더 구조

```
├── .github/workflows/deploy.yml   # GitHub Pages 자동 빌드·게시
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

## 반응형 기준

| 구간 | 폭 | 레이아웃 |
|---|---|---|
| 데스크톱 | 1280px 이상 | 왼쪽 고정 사이드바 + 본문 |
| 태블릿 | 768~1279px | 번호만 남긴 좁은 사이드바(72px), 두 칸 영역은 1100px 미만에서 한 칸 |
| 모바일 | 767px 이하 | 상단 가로 스크롤 메뉴, 주문 목록은 카드, 모든 영역 한 칸, 좌우 여백 16px |

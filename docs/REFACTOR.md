# dev-web 리팩토링 체크리스트

> 기준일: 2026-09-24 · 대상: `web/` (Next.js). `frontend/`는 web/으로 이식 완료된 구버전이라 삭제 대상.
> 사용법: 끝낸 항목은 `[ ]` → `[x]`, 요약표 숫자 갱신. 커밋 메시지에 ID를 넣는다 (`fix(FE-01): ...`).
> "완료 기준"은 *어떻게 확인했는지*다. 확인 못 했으면 체크하지 않는다.

## 진행 현황

| 우선순위 | 의미 | 완료 / 전체 |
|---------|------|------------|
| P0 | 버그 · 보안 · 법적 문제 | 0 / 10 |
| P1 | 구조 (파일/폴더/책임 분리) | 0 / 11 |
| P2 | 코드 품질 · 접근성 | 0 / 18 |
| P3 | 문서 · 도구 | 0 / 7 |

**담당:** P0는 별도 담당자가 맡는다 (크리티컬 항목은 GitHub 이슈로 추적 — P0 표 아래 링크). P1부터는 이 체크리스트 순서대로 진행한다.

**작업 순서:**
- P0 담당: FE-04~06 (#4) → FE-01~03 (#5) → FE-07 (#6) → FE-08 (#7) → FE-09, FE-10
- P1 이후: FE-11 `lib/api.js`, FE-12 `ndjson.js` → FE-14 CSS 범위 묶기, FE-15 토큰 통일 → FE-13 컴포넌트 분리 → `frontend/` 삭제, FE-41 README 다시 쓰기
- **P0와 겹치는 P1:** FE-11(`apiFetch`)이 들어오면 FE-01·03·06의 `res.ok`/401 처리가 그 안으로 합쳐진다. P0 담당과 머지 순서를 맞출 것 — 먼저 머지되는 쪽에 맞춰 다른 쪽이 rebase한다.

---

## P0 — 버그 · 보안 · 법적 문제

| ID | 상태 | 위치 | 문제 | 수정 방법 | 완료 기준 |
|----|------|------|------|----------|----------|
| FE-01 | [ ] | `web/src/app/admin/page.js:219-223` | `loadHistoryBasedRecs`가 `res.ok`를 확인하지 않음. 500 응답이면 572행 `.found.length`에서 페이지 전체가 멈춤 | try/catch를 두르고, `!res.ok`이면 `{found: []}`와 에러 메시지 표시 | 백엔드를 끄고 AI 패널 열기 → 페이지가 유지되고 에러 문구가 보임 |
| FE-02 | [ ] | `admin/page.js:226-240` | `loadStrategy`에 try가 없음. 네트워크 오류가 나면 스피너가 영원히 돎 | `try/finally`로 `setStrategyLoading(false)` 보장 | 백엔드를 끄고 전략 탭 열기 → 스피너가 사라짐 |
| FE-03 | [ ] | `admin/page.js:264`, `customer/page.js:339-340` | 스트림을 읽기 전에 `res.ok`를 확인하지 않음. 422/500이면 "생각하고 있어요..."에서 멈춤 | `if (!res.ok)`에서 detail을 읽어 에러로 표시 | 빈 질문(422) 전송 → 에러 문구가 보임 |
| FE-04 | [ ] | `customer/page.js:162-168` | 로그아웃해도 이름·전화·구매내역 state가 화면에 남음 (개인정보 노출) | 로그아웃 시 모든 state를 초기값으로 되돌림 | 로그인 → 마이페이지 → 로그아웃 → 개인정보가 안 보임 |
| FE-05 | [ ] | `admin/page.js:80-85` | `showLoginGate`가 AI 패널과 고객 목록을 비우지 않음 | `setAiPanelOpen(false)`, `setCustomers([])` 추가 | 토큰 만료 후 로그인 화면만 보임 |
| FE-06 | [ ] | `customer/page.js:97-146, 274, 303, 339` | `/me/*`가 401을 받아도 로그아웃 처리를 안 함 | FE-11 API 클라이언트의 `onUnauthorized`로 로그아웃 | localStorage 토큰을 조작하면 로그아웃 상태가 됨 |
| FE-07 | [ ] | `admin/page.js:398` | Chart.js를 CDN에서 SRI 없이 로드함. CDN이 오염되면 관리자 토큰이 탈취될 수 있음 | `npm i chart.js`로 번들에 포함 | 네트워크 탭에 cdnjs 요청이 없음 |
| FE-08 | [ ] | `web/public/pets/*.jpg` | CC BY / BY-SA 사진 6장에 출처 표기가 없음 (라이선스 위반) | `(site)/layout.js` footer에 작성자와 라이선스 링크 추가 | footer에 CREDITS.json 6건이 모두 보임 |
| FE-09 | [ ] | `dev-data-embed/docker-compose.yml:13` | `../dev-web/dev-web/frontend`로 경로가 틀렸고, 가리키는 대상도 죽은 코드 | FE-28 결정에 따라 web 서비스를 삭제하거나 `web/` Dockerfile로 교체 | `docker compose config` 통과 |
| FE-10 | [ ] | `admin/page.js:139,187`, `customer/page.js:151,195,258` | JWT가 localStorage에 있어 XSS로 읽힐 수 있음 | 단기: 위험을 README에 명시. 장기: rewrites로 같은 origin을 만들고 httpOnly 쿠키로 전환 | README에 명시됨 (장기 작업은 별도 이슈) |

> 이슈: FE-04~06 → [#4](https://github.com/TodayWhatDish/dev-web/issues/4) · FE-01~03 → [#5](https://github.com/TodayWhatDish/dev-web/issues/5) · FE-07 → [#6](https://github.com/TodayWhatDish/dev-web/issues/6) · FE-08 → [#7](https://github.com/TodayWhatDish/dev-web/issues/7). FE-09·10은 체크리스트로만 관리한다.

## P1 — 구조

| ID | 상태 | 위치 | 문제 | 수정 방법 | 완료 기준 |
|----|------|------|------|----------|----------|
| FE-11 | [ ] | admin 12곳, customer fetch | API 호출 공통 함수가 없어 base URL, `Authorization` 헤더, 401 처리가 복사돼 있음 | `src/lib/api.js`에 `apiFetch(path, {token, onUnauthorized})` 작성 (JSON 파싱, `!res.ok`이면 throw) | `grep "fetch(" src/app` 결과가 0건 |
| FE-12 | [ ] | `admin:267-288`, `customer:343-363` | NDJSON 스트림 파서가 두 곳에 중복됨 | `src/lib/ndjson.js`의 `readNdjson(res, onChunk, signal)`와 AbortController 사용 | 두 페이지 모두 이 함수로 질문 응답이 나옴 |
| FE-13 | [ ] | `admin/page.js`(648줄), `customer/page.js`(642줄) | 거대한 page 파일 (state 25개 이상) | `features/admin/*`, `features/customer/*` 컴포넌트와 `useAuthToken`, `useAskStream` 훅으로 분리 | 두 page 파일 각각 50줄 이하 |
| FE-14 | [ ] | `admin.css:2,17`, `customer.css:6,10,26,40` | route CSS가 전역이라 `* / :root / body / header / .btn / .hero`가 다른 페이지로 번짐 | 단기: `.admin-page` / `.customer-page` 래퍼로 범위 묶기. 정석: `*.module.css` | 랜딩 → /customer → 뒤로가기 했을 때 랜딩 스타일이 그대로 |
| FE-15 | [ ] | `customer.css:10-21`, `site.css:5-11`, `admin.css:2-15` | 색 토큰이 세 벌 있고 이름이 틀림 (`--teal`이 실제로는 #E5883A 갈색) | `globals.css :root` 한 곳에 site 쪽 이름으로 선언하고 admin도 브라운으로 통일 | `grep -- "--teal" src` 0건, admin이 브라운 톤 |
| FE-16 | [ ] | admin/customer `page.js` | 전체가 'use client'라 metadata를 쓸 수 없음 (탭 제목이 모두 같고 /admin에 noindex 없음) | `page.js`는 서버 컴포넌트로 두고 metadata export 후 `<AdminApp/>` 렌더 | 탭 제목이 페이지마다 다르고, /admin HTML에 `noindex`가 있음 |
| FE-17 | [ ] | `admin:9`, `customer:10` | `API` 상수가 두 곳에 있고, env가 없으면 production에서도 localhost로 빌드됨 | `lib/api.js` 한 곳으로 모으고, `.env.example` 추가, production에서 값이 없으면 throw | env 없이 `npm run build`하면 명확한 에러 |
| FE-18 | [ ] | `admin:12-33`, `customer:28-30` | SIZE/ACTIVITY/GENDER 라벨 맵이 중복됨 | `src/lib/labels.js` 하나로 합치기 | 라벨 정의가 1곳 |
| FE-19 | [ ] | `admin:421-424` | 회원/질문/시스템 뷰가 state라서 URL과 뒤로가기가 안 됨 | `admin/(dashboard)/members\|questions\|system/page.js`와 공용 layout | 각 뷰에 URL이 있고 뒤로가기가 동작 |
| FE-20 | [ ] | `frontend/`, `.vscode/tasks.json` | web/으로 이식이 끝난 구버전 코드 | 폴더 삭제 (tasks.json은 Windows에 없는 `lsof`도 씀) | `frontend/` 없음, 다른 곳에서 참조 0건 |
| FE-28 | [ ] | `web/` 배포 | Vercel로 갈지 Docker로 갈지 정해지지 않음 | 하나로 결정. Docker면 `output: 'standalone'`과 `web/Dockerfile`. 공통으로 rewrites `/api/:path*` → 백엔드 | 결정 내용이 README에 있고 배포 1회 성공 |

## P2 — 코드 품질 · 접근성

| ID | 상태 | 위치 | 문제 | 수정 방법 | 완료 기준 |
|----|------|------|------|----------|----------|
| FE-21 | [ ] | `admin:191-195` | 고객을 연달아 클릭하면 늦게 도착한 응답이 화면을 덮어씀 | AbortController 또는 id 비교 | 빠르게 클릭해도 마지막으로 고른 고객이 보임 |
| FE-22 | [ ] | `admin:316-342` | 차트를 destroy하지 않고, `purchased_at`이 null이면 터짐 | effect cleanup과 `(a.purchased_at \|\| '')` | 뷰를 전환해도 콘솔 에러 없음 |
| FE-23 | [ ] | `admin:142,145,158`, `customer:155` | eslint-disable 주석 4개 | FE-13 훅 분리와 함께 제거 | `npm run lint` 경고 0건 |
| FE-24 | [ ] | `customer:265-290, 436-445` | 리뷰 대상을 배열 index로 기억해서 다른 구매에 리뷰가 붙을 수 있음 | `purchase_id`로 기억 | 목록을 새로고침한 뒤에도 같은 구매에 리뷰가 달림 |
| FE-25 | [ ] | `customer:47-55` | 비로그인 목업 카드가 실제 추천처럼 보임 ("유사도 0.91") | "예시" 배지를 붙이거나 로그인 유도 화면으로 교체 | 비로그인 화면에 예시 표기가 있음 |
| FE-26 | [ ] | `customer:512`, `customer:505` | price가 null이면 터지고, `pickProductImage`를 두 번 호출함 | `c.price?.toLocaleString() ?? '-'`, 결과를 변수에 담아 한 번만 호출 | price가 null인 상품도 렌더됨 |
| FE-27 | [ ] | `customer:368` | 답변이 끝나면 답변에서 먼 추천 섹션으로 스크롤됨 | 스크롤 코드 삭제 | 답변 후 화면이 그대로 |
| FE-29 | [ ] | `customer:315` | 질문 횟수 제한을 화면에서만 셈 (새로고침하면 리셋) | 서버에서 강제하도록 넘기거나 한계를 문서에 명시 | 결정 내용이 문서에 있음 |
| FE-30 | [ ] | `customer:381, 480` | 고객 페이지에 `/admin` 링크가 노출되고 `href="#"` 죽은 링크가 있음 | 둘 다 제거 | 고객 화면에서 admin 링크 0건 |
| FE-31 | [ ] | `admin:405-620`, `(site)/*` | 인라인 style이 30곳 이상이고 색이 하드코딩됨 (`#c0392b` 등) | `.error-text`, `.status-dot--ok` 같은 클래스와 토큰으로 교체 | `grep "style={{" src` 대폭 감소 |
| FE-32 | [ ] | admin 7곳, customer 3곳 | `key={i}` | 고유 id를 key로 사용 | `grep "key={i}"` 0건 |
| FE-33 | [ ] | `<img>` 20곳 이상, `customer-bg.png`(283KB) | 이미지 최적화가 없음 | `next/image` 사용, 배경은 webp로 변환 | Lighthouse 이미지 경고 감소 |
| FE-34 | [ ] | `globals.css:1-26, 57`, `admin:396-397` | @font-face를 직접 선언함, client body 안에 Google Fonts link가 있음, 로드된 적 없는 `Inter`와 `Arial`이 참조됨 | `next/font/local`로 Pretendard와 Jua 로드 | 폰트 link 태그 0건, 기본 서체가 Pretendard |
| FE-35 | [ ] | `globals.css:29-39, 45-49, 73-77`, `admin:612-615` | 다크모드 반쪽 적용으로 input이 검게 나오고, `overflow-x: hidden`이 두 곳에 걸려 sticky nav가 깨질 수 있음 | 다크 블록을 지우고 `color-scheme: light`, 중복된 overflow 규칙 삭제 | OS 다크모드에서도 input이 흰색, 스크롤할 때 nav가 고정됨 |
| FE-36 | [ ] | `admin:441,361-365,553-645`, `customer:406,523-639,537-558` | 클릭 가능한 div, role 없는 모달, label 없는 input, `×`에 aria-label 없음 | `<button>`과 네이티브 `<dialog>`로 교체, label과 aria 추가 | 키보드만으로 로그인, 고객 선택, 모달 닫기(Esc)가 됨 |
| FE-37 | [ ] | `site.css:76`, `(site)/layout.js` | `aria-current` 스타일은 있는데 설정하는 곳이 없음 | `usePathname`을 쓰는 NavLink 컴포넌트 | 현재 메뉴가 강조됨 |
| FE-38 | [ ] | `customer.css:1-5`, `admin.css:1`, `customer/page.js:2` | 현재 코드와 맞지 않는 옛 주석 | 삭제하거나 현재 내용에 맞게 고침 | 주석과 코드가 일치 |
| FE-39 | [ ] | `(site)/contact/ContactForm.js:6`, `admin:509-512` | `hello@example.com` 자리표시자가 그대로 배포됨, 비어 있는 "검증" 탭이 노출됨 | 실제 주소로 바꾸고 빈 탭은 숨김 | 배포 화면에 자리표시자 0건 |

## P3 — 문서 · 도구

| ID | 상태 | 위치 | 문제 | 수정 방법 | 완료 기준 |
|----|------|------|------|----------|----------|
| FE-40 | [ ] | `web/public/{next,vercel,globe,file,window}.svg`, `logo-paw.png` | 안 쓰는 scaffold 파일 | 삭제 | 참조 0건 확인 후 삭제 |
| FE-41 | [ ] | 루트 `README.md`, `web/README.md` | Vanilla JS, `frontend/`, 없는 FSD 폴더, create-next-app 기본 문구 | `web/` 기준으로 다시 씀 (실행법, env, 배포, 구조) | 새 사람이 README만 보고 `npm run dev` 성공 |
| FE-42 | [ ] | `docs/RULE.md`, `docs/SKILL.md`, `frontend/AGENTS.md`, 루트 `AGENTS.md` 빈 섹션 | 비어 있는 문서 | 채우거나 삭제 | 빈 문서 0건 |
| FE-43 | [ ] | `docs/DESIGN.md` | 없는 route와 `backend/` 경로를 설명함 | 실제 구조와 맞춤 | 문서 속 경로가 모두 실제로 존재 |
| FE-44 | [ ] | `web/jsconfig.json:4` | `@/*`가 `./*`를 가리킴 (src 밖) | `["./src/*"]`로 변경 | `@/lib/api` import가 동작 |
| FE-45 | [ ] | `web/package.json` | 쓰지 않는 playwright, CI 없음 | 제거하거나 스모크 테스트 1개 추가, GitHub Action(lint + build) | PR에서 CI가 녹색 |
| FE-46 | [ ] | 루트 `.gitignore`, `.vscode/settings.json` | Python 템플릿 gitignore와 conda 설정 | Node용으로 교체하고 conda 설정 제거 | `node_modules`, `.next`, `.env*.local`이 무시됨 |

---

## 목표 구조 (web/)

```
web/
├─ .env.example              # NEXT_PUBLIC_API_URL
├─ next.config.mjs           # rewrites /api → backend
└─ src/
   ├─ app/                   # 라우트만. 화면 조립 + metadata
   │  ├─ layout.js  globals.css        # 색 토큰은 여기 한 곳, next/font
   │  ├─ (site)/  page.js about/ service/ contact/ site.css
   │  ├─ customer/ page.js customer.module.css
   │  └─ admin/    layout.js(noindex) page.js admin.module.css
   ├─ features/              # 페이지 단위 기능 컴포넌트
   │  ├─ admin/    AdminApp LoginGate CustomerSidebar CustomerProfile
   │  │            PurchaseTable SpendChart AiPanel/ QuestionsView SystemView
   │  └─ customer/ CustomerApp AskBox RecommendCards MyPagePanel LoginModal SignupModal
   ├─ components/            # 어디서나 쓰는 작은 부품: Modal(<dialog>) Spinner NavLink
   ├─ hooks/                 # useAuthToken useAskStream
   └─ lib/                   # api.js ndjson.js labels.js (화면 없는 순수 로직)
```

FSD는 페이지 2개 규모에서는 과해서 쓰지 않는다. `app/`은 URL, `features/`는 화면 덩어리, `lib/`는 화면 없는 로직으로 나눈다.

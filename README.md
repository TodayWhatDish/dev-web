<div align="center">

# 오늘뭐멍냥 — Web

후기로 고르는 우리 아이 사료 · 간식<br/>
서비스 소개 사이트 · 고객 페이지 · 관리자 대시보드

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React_19-20232A?logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)

</div>

<br/>

## 소개

오늘뭐멍냥은 반려동물의 알러지 · 체급 · 구매 이력을 근거로 AI가 사료와 간식을 추천하는 서비스입니다.
이 저장소는 **화면**을 담당하고, 데이터와 AI 기능은 백엔드 [dev-data-embed](https://github.com/TodayWhatDish/dev-data-embed)의 API를 호출해 받습니다.

## 화면 구성

| 화면 | 경로 | 설명 |
|---|---|---|
| **소개 사이트** | `/` `/service` `/about` `/contact` | 서비스 소개, 추천 방식 설명, 문의 폼 |
| **고객 페이지** | `/customer` | 회원가입(펫 · 알러지 · 식성 설문), 맞춤 추천, 스트리밍 AI 상담, 구매 · 리뷰 |
| **관리자 대시보드** | `/admin` | 고객 검색 · 상세, 구매 금액 그래프, 추천 · 판매 전략 · AI 질문 패널, 질문 기록 |

## 아키텍처

```mermaid
flowchart LR
    subgraph WEB[dev-web · Next.js]
        SITE[소개 사이트]
        C[고객 페이지]
        A[관리자 대시보드]
    end

    C -->|/signup · /login · /me/* · /ask/me| API
    A -->|/admin/login · /api/customers · /ask| API
    API[dev-data-embed<br/>FastAPI]
```

- **자체 백엔드가 없습니다.** 요청 · 응답 모양, 상태코드, 에러 메시지의 기준은 항상 dev-data-embed입니다.
- **답변은 한 줄씩 그립니다.** `/ask` · `/ask/me`는 NDJSON 스트림이라, 줄 단위로 끊어 `type`별로 근거 → 답변 → 정확도 순으로 화면에 붙입니다.
- **인증은 JWT Bearer 토큰입니다.** 현재 `localStorage`에 저장하므로 XSS에 취약합니다. 같은 오리진 프록시 + httpOnly 쿠키로 옮길 예정입니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Framework | Next.js 16 (App Router), React 19, JavaScript |
| Style | 페이지별 CSS, Pretendard · Jua 웹폰트 |
| Chart | Chart.js (관리자 구매 금액 그래프) |
| API | dev-data-embed FastAPI — JWT 인증, NDJSON Streaming |
| Quality | ESLint |

## 프로젝트 구조

```
web/                    Next.js 앱
  src/app/
    (site)/             소개 사이트 — 홈 · 서비스 · 소개 · 문의
    customer/           고객 페이지
    admin/              관리자 대시보드
  public/               이미지 · 폰트
frontend/               구버전 정적 HTML/JS (삭제 예정)
docs/                   디자인 기준 · 리팩터링 체크리스트
```

## 로컬 실행

Node.js 22+와, `:8000`에서 실행 중인 [dev-data-embed](https://github.com/TodayWhatDish/dev-data-embed)가 필요합니다.

```bash
cd web
npm install
npm run dev            # http://localhost:3000
```

백엔드 주소는 `NEXT_PUBLIC_API_URL`(기본 `http://localhost:8000`)로 바꿉니다.
배포 도메인에서 부를 때는 백엔드 `FRONTEND_ORIGINS`(CORS)에 그 도메인을 추가해야 합니다.

## 더 보기

- [개발 규칙](./AGENTS.md)
- [디자인 기준](./docs/DESIGN.md)
- [리팩터링 체크리스트](./docs/REFACTOR.md)

MIT

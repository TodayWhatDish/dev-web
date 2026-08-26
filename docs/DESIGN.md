
backend features/: "도메인 단위" 기능. recommand, auth, admin처럼 API 리소스/도메인 하나가 폴더 하나 
frontend features/ (FSD): "사용자 행동 단위" 기능. auth-signup-form처럼 "폼 제출 하나", "버튼 클릭 하나"처럼 훨씬 잘게 쪼갠 것

## frontend/src/

- **app/** : Next.js 라우팅 전용 (페이지 조립만, 로직 없음)
  - **recommend/** : 추천 질의를 주고받는 프론트 페이지
  - **signup/** : 회원가입, 로그인에 필요한 프론트 페이지
  - **admin/** : 관리자 대시보드 프론트 페이지
- **widgets/** : 여러 화면 요소를 묶은 블록 (예: 추천 결과 패널, 대시보드 통계판)
- **features/** : 사용자 행동 단위 컴포넌트 (질문 입력폼, 회원가입 폼 등)
- **entities/** : 도메인 모델 + 전용 UI (반려동물, 제품, 유저)
- **shared/** : 여러 곳에서 재사용하는 것
  - **api/** : supabase client(브라우저용), fetch 래퍼 ?
  - **ui/** : 버튼 등 순수 UI 컴포넌트
  - **config/** : 프론트 공용 상수



## 기타

- **backend/AGENTS.md**, **frontend/AGENTS.md** : 해당 디렉토리 작업 시 지켜야 할 지시문. 코드 아님

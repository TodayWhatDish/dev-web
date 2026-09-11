'use client';
// 이 줄이 왜 필요한지는 파일 맨 아래 설명 참고 — 클릭/입력 같은 상호작용이 있는 컴포넌트는
// 브라우저에서 실행돼야 하니 Next.js에게 "이건 서버가 아니라 클라이언트에서 그려라" 표시한다.

import { useEffect, useRef, useState } from "react";
import "./customer.css";

// admin.js와 같은 자리 - 프론트와 백엔드가 다른 오리진이라 직접 적는다.
// 배포 주소는 Vercel 프로젝트의 NEXT_PUBLIC_API_URL 환경변수로 넣는다 - 코드는 안 건드린다.
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const QUOTA_MAX = 5;

// 재구조화안 그대로 보리/나비 두 마리, 카드 3장을 기본값(목업)으로 둔다.
// 로그인해서 실제 데이터(GET /me/pets, /me/recommend)가 오면 이 값을 통째로 갈아끼운다.
const DEFAULT_PETS = [
  { name: '보리', species: '강아지', emoji: '🐶' },
  { name: '나비', species: '고양이', emoji: '🐱' },
];
const DEFAULT_CARDS = [
  { key: 'mock-1', emoji: '🍖', brand: '그레인프리 키친', name: '연어 & 고구마 건식 사료', review: '소형견인데도 알갱이가 작아서 잘 먹어요. 냄새도 안 나고 변 상태도 좋아졌어요.', price: 32900, score: 0.91, productType: null, productId: null, bought: false },
  { key: 'mock-2', emoji: '🐟', brand: '퓨어펫', name: '화식 트릿 (닭가슴살)', review: '산책 훈련용으로 딱이에요. 크기도 작고 손에 안 묻어서 편해요.', price: 9900, score: 0.88, productType: null, productId: null, bought: false },
  { key: 'mock-3', emoji: '🥕', brand: '냥이부엌', name: '수제 동결건조 큐브', review: '알레르기 있는 고양이인데 반응 하나도 없었어요. 향도 좋아하네요.', price: 14500, score: 0.85, productType: null, productId: null, bought: false },
];

export default function CustomerPage() {
  // ---------------- 상태: 화면에 보이는 걸 결정하는 값은 전부 useState로 ----------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pets, setPets] = useState(DEFAULT_PETS);
  const [purchases, setPurchases] = useState([]);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [activeTab, setActiveTab] = useState('pets');
  const [quotaUsed, setQuotaUsed] = useState(0);

  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [signupOpen, setSignupOpen] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [allergenOptions, setAllergenOptions] = useState([]);
  const [allergensLoaded, setAllergensLoaded] = useState(false);

  const [reviewIndex, setReviewIndex] = useState(null); // null = 안 열림, 숫자면 그 purchases[i]를 리뷰중
  const [reviewError, setReviewError] = useState('');

  const [asking, setAsking] = useState(false);
  const [askAnswer, setAskAnswer] = useState('');
  const [askAnswerVisible, setAskAnswerVisible] = useState(false);
  const [askSources, setAskSources] = useState([]);

  // ---------------- ref: 화면엔 안 보이지만 값을 들고 있어야 하는 것들 ----------------
  // userToken은 렌더링에 직접 쓰이지 않아서(헤더에만 넣음) state 대신 ref로 둔다 - 바뀌어도 재렌더링 필요 없음
  const userTokenRef = useRef('');
  const cardsSectionRef = useRef(null); // 질문 답변 오면 이 위치로 스크롤

  async function loadMyPets() {
    try {
      const res = await fetch(`${API}/me/pets`, { headers: { Authorization: `Bearer ${userTokenRef.current}` } });
      if (res.ok) {
        const rows = await res.json();
        setPets(rows.map((p) => ({ name: p.name, species: p.animal_category, emoji: p.animal_category === '고양이' ? '🐱' : '🐶' })));
      }
    } catch { /* 실패해도 화면은 기존 값 그대로 둔다 */ }
    loadMyRecommend();
    loadMyPurchases();
  }

  async function loadMyPurchases() {
    try {
      const res = await fetch(`${API}/me/purchases`, { headers: { Authorization: `Bearer ${userTokenRef.current}` } });
      if (res.ok) {
        const rows = await res.json();
        setPurchases(rows.map((p) => ({ purchase_id: p.purchase_id, name: p.product_name, reviewed: p.rating != null })));
      }
    } catch { /* 실패해도 기존 값(빈 목록) 그대로 둔다 */ }
  }

  async function loadMyRecommend() {
    try {
      const res = await fetch(`${API}/me/recommend`, { headers: { Authorization: `Bearer ${userTokenRef.current}` } });
      if (!res.ok) return;
      const { found } = await res.json();
      if (!found || !found.length) return; // 후보가 없으면 기존 목업 카드를 그대로 둔다
      setCards(found.map((p) => ({
        key: p.product_id, emoji: '🐾', brand: p.brand, name: p.name, review: p.review,
        price: p.price_krw, score: p.score, productType: p.product_type || null,
        productId: p.product_id, bought: false,
      })));
    } catch { /* 실패해도 기존 목업 카드가 그대로 보인다 */ }
  }

  // 페이지 열릴 때 딱 한 번: 로그인 유지. 배경 사진은 이제 customer.css에 정적으로 박혀있어
  // (public/customer-bg.png) 따로 fetch할 게 없다.
  useEffect(() => {
    const token = localStorage.getItem('userToken') || '';
    if (token) {
      userTokenRef.current = token;
      // localStorage는 마운트 후에만 읽을 수 있어서 이 setState는 여기서만 가능하다 (의도된 1회성 렌더 추가)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
      loadMyPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- 로그인/회원가입 ----------------
  function handleLoginClick() {
    if (isLoggedIn) {
      userTokenRef.current = '';
      localStorage.removeItem('userToken');
      setIsLoggedIn(false);
      return;
    }
    setLoginError('');
    setLoginOpen(true);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError('');
    const fd = new FormData(e.currentTarget);
    const body = { email: fd.get('email'), password: fd.get('password') };
    setLoginSubmitting(true);
    let res;
    try {
      res = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch {
      setLoginError('서버에 연결할 수 없습니다.');
      setLoginSubmitting(false);
      return;
    }
    setLoginSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setLoginError(err.detail || '로그인에 실패했습니다.');
      return;
    }
    const { access_token } = await res.json();
    userTokenRef.current = access_token;
    localStorage.setItem('userToken', access_token);
    setLoginOpen(false);
    setIsLoggedIn(true);
    loadMyPets();
  }

  // 알레르겐 목록은 GET /allergens에서 딱 한 번만 받아온다 - 회원가입 모달 열 때마다 다시 안 부른다
  async function loadAllergenOptions() {
    if (allergensLoaded) return;
    try {
      const res = await fetch(`${API}/allergens`);
      if (!res.ok) return;
      setAllergenOptions(await res.json());
      setAllergensLoaded(true);
    } catch { /* 목록을 못 받아도 나머지 가입 절차는 그대로 진행한다 */ }
  }
  function handleSignupClick() {
    setSignupError('');
    setSignupOpen(true);
    loadAllergenOptions();
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setSignupError('');
    const fd = new FormData(e.currentTarget);
    const num = (key) => (fd.get(key) ? Number(fd.get(key)) : null);
    const body = {
      email: fd.get('email'),
      password: fd.get('password'),
      name: fd.get('name'),
      phone: fd.get('phone') || null,
      region: fd.get('region') || null,
      pet_name: fd.get('pet_name'),
      pet_species: fd.get('pet_species') || null,
      pet_gender: fd.get('pet_gender') || null,
      pet_birth_date: fd.get('pet_birth_date') || null,
      pet_weight_kg: fd.get('pet_weight_kg') ? Number(fd.get('pet_weight_kg')) : null,
      pet_size: num('pet_size'),
      pet_allergies: fd.getAll('pet_allergies'),
      pet_activity_level: num('pet_activity_level'),
      diet_note: fd.get('diet_note') || null,
      skin_note: fd.get('skin_note') || null,
    };

    setSignupSubmitting(true);
    let res;
    try {
      res = await fetch(`${API}/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch {
      setSignupError('서버에 연결할 수 없습니다.');
      setSignupSubmitting(false);
      return;
    }
    setSignupSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // 409(이메일 중복) / 422(형식 오류) 둘 다 서버가 detail을 준다 (app/api/routes/auth.py)
      setSignupError(err.detail || '회원가입에 실패했습니다.');
      return;
    }
    const { access_token } = await res.json();
    userTokenRef.current = access_token;
    localStorage.setItem('userToken', access_token);
    setSignupOpen(false);
    setIsLoggedIn(true);
    loadMyPets();
  }

  // ---------------- 리뷰 남기기 ----------------
  async function handleReviewSubmit(e, i) {
    e.preventDefault();
    setReviewError('');
    const fd = new FormData(e.currentTarget);
    const body = String(fd.get('body') || '').trim();
    if (!body) return;
    const rating = Number(fd.get('rating'));
    let res;
    try {
      res = await fetch(`${API}/me/purchases/${purchases[i].purchase_id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userTokenRef.current}` },
        body: JSON.stringify({ rating, body }),
      });
    } catch {
      setReviewError('서버에 연결할 수 없습니다.');
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setReviewError(err.detail || '리뷰 등록에 실패했습니다.');
      return;
    }
    setPurchases((prev) => prev.map((h, idx) => (idx === i ? { ...h, reviewed: true } : h)));
    setReviewIndex(null);
  }

  // ---------------- 추천 카드: 구매하기 ----------------
  async function handleBuy(card) {
    if (card.bought) return;
    if (card.productId) {
      // 로그인 후 실제 추천 카드 - POST /me/purchases로 진짜 purchase 행을 만든다
      try {
        const res = await fetch(`${API}/me/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userTokenRef.current}` },
          body: JSON.stringify({ product_id: Number(card.productId) }),
        });
        if (!res.ok) return;
      } catch { return; }
      loadMyPurchases();
    } else {
      // 로그인 전 안내용 목업 카드 - 화면 데모로만 반영한다
      setPurchases((prev) => [...prev, { name: card.name, reviewed: false }]);
    }
    setCards((prev) => prev.map((c) => (c.key === card.key ? { ...c, bought: true } : c)));
  }

  // ---------------- AI 질문창: 로그인 필요 + 일일 횟수 ----------------
  // quotaUsed는 여전히 화면에서만 세는 값이다 - 서버가 하루 횟수를 강제하지 않는다.
  const exhausted = quotaUsed >= QUOTA_MAX;

  async function handleAskSubmit(e) {
    e.preventDefault();
    if (!isLoggedIn || exhausted) return;
    const fd = new FormData(e.currentTarget);
    const question = String(fd.get('question') || '').trim();
    if (!question) return;

    setQuotaUsed((u) => u + 1);
    e.currentTarget.reset();
    setAsking(true);
    setAskAnswerVisible(true);
    setAskAnswer('답변을 생각하고 있어요...');
    setAskSources([]);
    let answering = false; // 첫 delta가 오기 전까지는 위 안내 문구를 그대로 둔다

    try {
      const res = await fetch(`${API}/ask/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userTokenRef.current}` },
        body: JSON.stringify({ user_query: question }),
      });
      if (res.status === 401) { setAskAnswer('로그인이 만료됐어요. 다시 로그인해주세요.'); return; }
      if (!res.body) { setAskAnswer('응답을 받지 못했습니다.'); return; }

      // NDJSON을 줄 단위로 읽는다 - 네트워크 조각이 줄 한가운데를 자를 수 있어 buffer가 꼭 필요하다
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.type === 'delta') {
              if (!answering) { setAskAnswer(''); answering = true; }
              setAskAnswer((prev) => prev + chunk.text);
            } else if (chunk.type === 'sources') setAskSources(chunk.sources || []);
            else if (chunk.type === 'error') setAskAnswer(chunk.message);
          } catch { /* 깨진 줄 하나 때문에 전체를 멈추지 않는다 */ }
        }
      }
    } catch {
      setAskAnswer('서버에 연결할 수 없습니다.');
    } finally {
      setAsking(false);
      cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <div className="page">
        <header>
          <div className="logo">
            <div className="logo-mark">🐾</div>
            오늘뭐멍냥
          </div>
          <div className="auth-buttons">
            <a className="admin-link" href="/admin">관리자페이지</a>
            <button type="button" className="btn btn-ghost" onClick={handleLoginClick}>{isLoggedIn ? '로그아웃' : '로그인'}</button>
            <button type="button" className="btn btn-solid" onClick={handleSignupClick} hidden={isLoggedIn}>회원가입</button>
          </div>
        </header>

        <div className="profile-strip">
          <div className="pill-scroll">
            {activeTab === 'pets' ? (
              pets.length === 0
                ? <span className="empty-msg">등록된 반려동물이 없어요.</span>
                : pets.map((p, i) => <div className="pet-pill" key={i}><div className="avatar">{p.emoji}</div>{p.name}</div>)
            ) : (
              purchases.length === 0
                ? <span className="empty-msg">아직 구매한 상품이 없어요.</span>
                : purchases.map((h, i) => (
                  <div className="purchase-pill" key={i}>
                    <span>{h.name}</span>
                    {h.reviewed
                      ? <span className="p-done">작성 완료</span>
                      : <button type="button" className="p-review-btn" onClick={() => setReviewIndex(i)}>리뷰 남기기</button>}
                  </div>
                ))
            )}
          </div>
          <div className="tab-switch">
            <button type="button" className={activeTab === 'pets' ? 'active' : ''} onClick={() => { setActiveTab('pets'); setReviewIndex(null); }}>우리 아이</button>
            <button type="button" className={activeTab === 'purchases' ? 'active' : ''} onClick={() => { setActiveTab('purchases'); setReviewIndex(null); }}>구매 이력</button>
          </div>
        </div>

        {reviewIndex !== null && (
          <form className="review-panel" onSubmit={(e) => handleReviewSubmit(e, reviewIndex)}>
            <select name="rating" defaultValue="5">
              <option value="5">★★★★★</option>
              <option value="4">★★★★</option>
              <option value="3">★★★</option>
              <option value="2">★★</option>
              <option value="1">★</option>
            </select>
            <textarea name="body" placeholder={`${purchases[reviewIndex].name} 후기를 남겨주세요`}></textarea>
            <button type="submit">등록</button>
            <div className="modal-error">{reviewError}</div>
          </form>
        )}

        <div className="hero">
          <div className="hero-copy">
            <div className="eyebrow">TODAY&apos;S PICK · 2026</div>
            <h1>우리 아이 오늘 한 끼,<br />근거 있는 <span className="hl">후기</span>로 골라요.</h1>
            <p>실제로 산 사람들의 후기에서 찾은 근거만 보여드려요. 축종·체구·알레르기까지 우리 아이 프로필에 맞춰 걸러낸 사료와 간식이에요.</p>
            <div className="hero-actions">
              <button type="button" className="btn-cta">오늘의 추천 보러가기 →</button>
              <button type="button" className="link-quiet">어떻게 고르나요?</button>
            </div>
          </div>

          <div className="hero-card">
            <div className="ai-box">
              <div className="ai-box-top">
                <span className="ai-label">AI 추천 질문</span>
                <span className="ai-quota">오늘 {QUOTA_MAX - quotaUsed}/{QUOTA_MAX} 질문 가능</span>
              </div>
              <form className="ai-input-row" onSubmit={handleAskSubmit}>
                <input type="text" name="question" placeholder="예) 알레르기 없는 소형견 사료 추천해줘" disabled={!isLoggedIn || exhausted} />
                <button type="submit" disabled={!isLoggedIn || exhausted || asking}>
                  {asking ? <span className="spinner dark" /> : '질문'}
                </button>
              </form>
              <div className={isLoggedIn && exhausted ? 'ai-note upsell' : 'ai-note'}>
                {!isLoggedIn
                  ? '로그인 후 이용할 수 있어요.'
                  : exhausted
                    ? <>오늘 질문을 다 썼어요. <a href="#">멤버십으로 무제한 질문하기 →</a></>
                    : '우리 아이 프로필 기준으로 답해드려요.'}
              </div>
              {askAnswerVisible && <div className="ai-answer">{askAnswer}</div>}
              <div className="ai-sources">
                {askSources.slice(0, 3).map((s, i) => (
                  <div className="ai-source-item" key={i}>
                    {s.name} ({s.brand}){s.product_type && <> · <span className="badge-type">{s.product_type}</span></>} · 유사도 {s.score.toFixed(3)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="section-title" ref={cardsSectionRef}>
          <h2>오늘의 추천</h2>
          <span>우리 아이 프로필 기준 · 실제 후기 근거</span>
        </div>
        <div className="cards">
          {cards.map((c) => (
            <div className="card" key={c.key}>
              <div className="card-thumb">{c.emoji}</div>
              <div className="brand">{c.brand}</div>
              {c.productType && <span className="badge-type">{c.productType}</span>}
              <div className="name">{c.name}</div>
              <div className="review">&quot;{c.review}&quot;</div>
              <div className="card-foot">
                <span className="price">{c.price.toLocaleString()}원</span>
                <span className="badge-score">유사도 {c.score.toFixed(2)}</span>
              </div>
              <button type="button" className={c.bought ? 'btn-buy bought' : 'btn-buy'} onClick={() => handleBuy(c)} disabled={c.bought}>
                {c.bought ? '구매 완료 ✓' : '구매하기'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="modal-overlay" hidden={!loginOpen}>
        <div className="modal-box">
          <h3>로그인</h3>
          <form onSubmit={handleLoginSubmit}>
            <input type="email" name="email" placeholder="이메일" required />
            <input type="password" name="password" placeholder="비밀번호" required />
            <div className="modal-error">{loginError}</div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setLoginOpen(false)}>취소</button>
              <button type="submit" className="btn btn-solid" disabled={loginSubmitting}>
                {loginSubmitting ? <span className="spinner" /> : '로그인'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="modal-overlay" hidden={!signupOpen}>
        <div className="modal-box">
          <h3>회원가입</h3>
          <form onSubmit={handleSignupSubmit}>
            <input type="email" name="email" placeholder="이메일" required />
            <input type="password" name="password" placeholder="비밀번호" required />
            <input type="text" name="name" placeholder="이름" required />
            <input type="tel" name="phone" placeholder="연락처 (선택)" />
            <input type="text" name="region" placeholder="지역 (선택)" />
            <hr />
            <input type="text" name="pet_name" placeholder="반려동물 이름" required />

            <div className="qa-block">
              <span className="qa-label">강아지인가요, 고양이인가요?</span>
              <div className="radio-row">
                <label><input type="radio" name="pet_species" value="개" defaultChecked /> 강아지</label>
                <label><input type="radio" name="pet_species" value="고양이" /> 고양이</label>
              </div>
            </div>

            <div className="qa-block">
              <span className="qa-label">성별이 어떻게 되나요? (선택)</span>
              <select name="pet_gender" defaultValue="">
                <option value="">선택 안 함</option>
                <option value="M">수컷</option>
                <option value="F">암컷</option>
              </select>
            </div>

            <div className="qa-block">
              <span className="qa-label">태어난 날짜는 언제인가요? (선택)</span>
              <input type="date" name="pet_birth_date" />
            </div>

            <div className="qa-block">
              <span className="qa-label">체중은 몇 kg인가요? (선택)</span>
              <input type="number" name="pet_weight_kg" placeholder="예: 4.5" step="0.1" min="0" />
            </div>

            <div className="qa-block">
              <span className="qa-label">체구는 어느 정도인가요? (선택)</span>
              <select name="pet_size" defaultValue="">
                <option value="">선택 안 함</option>
                <option value="1">초소형</option>
                <option value="2">소형</option>
                <option value="3">중형</option>
                <option value="4">대형</option>
                <option value="5">초대형</option>
              </select>
            </div>

            <div className="qa-block">
              <span className="qa-label">평소 활동량은 어느 정도인가요? (선택)</span>
              <select name="pet_activity_level" defaultValue="">
                <option value="">선택 안 함</option>
                <option value="1">적음</option>
                <option value="2">보통</option>
                <option value="3">많음</option>
              </select>
            </div>

            <div className="qa-block">
              <span className="qa-label">먹는 걸 밝히거나 입이 까다로운 편인가요? (선택)</span>
              <input type="text" name="diet_note" placeholder="예: 식탐이 많아요 / 입이 까다로워요" />
            </div>

            <div className="qa-block">
              <span className="qa-label">피부 상태는 어떤가요? (선택)</span>
              <input type="text" name="skin_note" placeholder="예: 피부가 예민한 편이에요" />
            </div>

            <div className="qa-block">
              <span className="qa-label">알러지가 있나요? 있는 항목을 모두 체크해주세요 (선택)</span>
              <div className="allergy-list">
                {allergenOptions.map((name) => (
                  <label key={name}><input type="checkbox" name="pet_allergies" value={name} />{name}</label>
                ))}
              </div>
            </div>

            <div className="modal-error">{signupError}</div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSignupOpen(false)}>취소</button>
              <button type="submit" className="btn btn-solid" disabled={signupSubmitting}>
                {signupSubmitting ? <span className="spinner" /> : '가입하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

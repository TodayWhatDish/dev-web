'use client';
// frontend/public/admin/admin.js (vanilla JS)를 Next.js로 옮긴 것 - customer/page.js와 같은 패턴.

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "./admin.css";

// customer/page.js와 같은 자리 - 배포 주소는 Vercel의 NEXT_PUBLIC_API_URL 환경변수로 넣는다.
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---- admin.js의 라벨 헬퍼 그대로 ----
const petEmoji = (species) => (species === "개" ? "🐶" : species === "고양이" ? "🐱" : "🐾");
const speciesLabel = (species) => (species === "개" ? "강아지" : species);
const petCategory = (speciesCsv) => {
  const has = (s) => (speciesCsv || "").includes(s);
  if (has("개") && has("고양이")) return "모두";
  if (has("개")) return "강아지";
  if (has("고양이")) return "고양이";
  return "미등록";
};
const genderLabel = (g) => (g === "M" ? "♂" : g === "F" ? "♀" : "-");
const activityLabel = (level) => ({ 1: "적음", 2: "보통", 3: "많음" }[level] || "-");
const sizeLabel = (size) => ({ 1: "초소형", 2: "소형", 3: "중형", 4: "대형", 5: "초대형" }[size] || "-");
const neuteredLabel = (n) => (n === 1 ? "완료" : n === 0 ? "안 함" : "-");
const ageLabel = (birthDate) => {
  if (!birthDate) return "-";
  const b = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) return "-";
  return months < 12 ? `${months}개월` : `${Math.floor(months / 12)}살`;
};
// 이름 또는 고객 id(부분 일치)로 검색
const matchesSearch = (c, kw) => c.name.toLowerCase().includes(kw) || String(c.user_id).includes(kw);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // 사료/간식 표 정렬 상태 - 헤더 클릭마다 갱신
  const [purchaseSort, setPurchaseSort] = useState({
    사료: { key: "purchased_at", dir: "desc" },
    간식: { key: "purchased_at", dir: "desc" },
  });

  const [view, setView] = useState('members'); // members | verify | questions | system

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiTab, setAiTab] = useState('recs'); // recs | strategy | ask
  const [historyRecs, setHistoryRecs] = useState(null); // null=로딩중, {found, product_name}
  const [strategyResult, setStrategyResult] = useState(null); // {strategy, citations} | {error}
  const [strategyLoading, setStrategyLoading] = useState(false);

  const [askAnswer, setAskAnswer] = useState('');
  const [askSources, setAskSources] = useState([]);
  const [askFacts, setAskFacts] = useState('');
  const [askVerify, setAskVerify] = useState('');
  const [askError, setAskError] = useState('');
  const [asking, setAsking] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ db: null, api: null });
  const [chartReady, setChartReady] = useState(false);

  const adminTokenRef = useRef('');
  // askQuestion()이 겹쳐 호출돼도 오래된 스트림이 화면에 못 쓰게 막는 세대 번호
  const askGenRef = useRef(0);
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const authHeaders = () => ({ Authorization: `Bearer ${adminTokenRef.current}` });

  const showLoginGate = () => {
    adminTokenRef.current = '';
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setSelectedCustomer(null);
  };

  async function getCustomers() {
    const res = await fetch(`${API}/api/customers`, { headers: authHeaders() });
    if (res.status === 401) { showLoginGate(); throw new Error('토큰 만료'); }
    if (!res.ok) throw new Error();
    return res.json();
  }
  async function getCustomerInfo(id) {
    const res = await fetch(`${API}/api/customers/${id}`, { headers: authHeaders() });
    if (res.status === 401) { showLoginGate(); throw new Error('토큰 만료'); }
    if (!res.ok) throw new Error();
    return res.json();
  }

  async function loadCustomers() {
    try {
      setCustomers(await getCustomers());
    } catch { /* 401은 showLoginGate가 처리, 그 외 실패는 목록을 빈 채로 둔다 */ }
  }

  async function checkSystemStatus() {
    try {
      const res = await fetch(`${API}/ready`);
      const data = await res.json();
      setSystemStatus({ db: !!data.db, api: !!data.llm });
    } catch {
      setSystemStatus({ db: false, api: false });
    }
  }

  async function loadQuestions() {
    setQuestionsLoading(true);
    setQuestionsError(false);
    try {
      const res = await fetch(`${API}/api/questions`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      setQuestions(await res.json());
    } catch {
      setQuestionsError(true);
    } finally {
      setQuestionsLoading(false);
    }
  }

  function enterAdmin() {
    setIsLoggedIn(true);
    loadCustomers();
    checkSystemStatus();
  }

  // 새로고침해도 로그인 상태 유지 - 토큰이 만료됐으면 getCustomers()가 401을 받아 자동으로 로그인 화면으로 돌려보낸다
  useEffect(() => {
    const token = localStorage.getItem('adminToken') || '';
    if (token) {
      adminTokenRef.current = token;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      enterAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const id = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(id);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (view === 'system') checkSystemStatus();
    if (view === 'questions') loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isLoggedIn]);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError('');
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password');
    setLoginSubmitting(true);
    let res;
    try {
      res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
    } catch {
      setLoginError('서버에 연결할 수 없습니다.');
      setLoginSubmitting(false);
      return;
    }
    setLoginSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setLoginError(body.detail || '로그인 실패');
      return;
    }
    const { access_token } = await res.json();
    adminTokenRef.current = access_token;
    localStorage.setItem('adminToken', access_token);
    enterAdmin();
  }

  async function selectCustomer(userId) {
    try {
      setSelectedCustomer(await getCustomerInfo(userId));
    } catch { /* 401은 showLoginGate가 처리 */ }
  }

  function sortPurchases(type, key) {
    setPurchaseSort((prev) => {
      const cur = prev[type];
      const dir = cur.key === key ? (cur.dir === 'desc' ? 'asc' : 'desc') : 'desc';
      return { ...prev, [type]: { key, dir } };
    });
  }

  function openAiPanel() {
    if (!selectedCustomer) return;
    setAiPanelOpen(true);
    setAiTab('recs');
    setHistoryRecs(null);
    setStrategyResult(null);
    setAskAnswer(''); setAskSources([]); setAskFacts(''); setAskVerify(''); setAskError('');
    loadHistoryBasedRecs(selectedCustomer.user_id);
  }
  function closeAllPanels() {
    setAiPanelOpen(false);
  }

  // 이 고객이 실제로 남긴 최근 리뷰를 근거로 한 추천. 질문 없이도 패널을 열면 항상 뜬다
  async function loadHistoryBasedRecs(userId) {
    const res = await fetch(`${API}/api/customers/${userId}/similar-reviews`, { headers: authHeaders() });
    if (res.status === 401) { showLoginGate(); return; }
    setHistoryRecs(await res.json());
  }

  // 판매전략/CS 응대안 생성. LLM 호출 비용이 있어 버튼으로 트리거한다.
  async function loadStrategy() {
    setStrategyLoading(true);
    const res = await fetch(`${API}/api/customers/${selectedCustomer.user_id}/strategy`, {
      method: 'POST',
      headers: authHeaders(),
    });
    setStrategyLoading(false);
    if (res.status === 401) { showLoginGate(); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStrategyResult({ error: err.detail ?? '생성 실패' });
      return;
    }
    setStrategyResult(await res.json());
  }

  // 선택된 고객의 첫 번째 펫 프로필로 /ask를 스트리밍 호출. NDJSON을 줄 단위로 읽는다.
  async function askQuestion(question) {
    const myGen = ++askGenRef.current;
    setAskAnswer(''); setAskSources([]); setAskFacts(''); setAskVerify(''); setAskError('');

    // 델타가 네트워크 조각 단위로 오더라도 화면엔 한 글자씩 흘러나오게 큐에 쌓아 타이핑한다
    let typeQueue = '';
    const typeTimer = setInterval(() => {
      if (myGen !== askGenRef.current) { clearInterval(typeTimer); return; }
      if (!typeQueue) return;
      setAskAnswer((prev) => prev + typeQueue[0]);
      typeQueue = typeQueue.slice(1);
    }, 20);

    const petId = (selectedCustomer.pets || [])[0]?.pet_id ?? null;

    try {
      const res = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ user_query: question, pet_id: petId, user_id: selectedCustomer.user_id }),
      });
      if (res.status === 401) { showLoginGate(); return; }
      if (!res.body) { setAskError('응답을 받지 못했습니다.'); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        if (myGen !== askGenRef.current) { reader.cancel(); return; } // 그 사이 새 질문이 시작됐으면 그만 읽는다
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.type === 'customer_facts') setAskFacts(chunk.text);
            else if (chunk.type === 'verification') setAskVerify(`반증 결과 · 정확도 ${Math.round(chunk.accuracy * 100)}% — ${chunk.note}`);
            else if (chunk.type === 'sources') setAskSources(chunk.sources || []);
            else if (chunk.type === 'delta') typeQueue += chunk.text;
            else if (chunk.type === 'error') setAskError(chunk.message);
          } catch { /* 깨진 줄 하나 때문에 전체를 멈추지 않는다 */ }
        }
      }
    } finally {
      // 큐에 남은 글자를 마저 흘려보낸 뒤 타이머를 정리한다
      const drain = setInterval(() => {
        if (myGen !== askGenRef.current || !typeQueue) {
          clearInterval(typeTimer);
          clearInterval(drain);
        }
      }, 20);
    }
  }

  async function handleAskSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = String(fd.get('question') || '').trim();
    if (!text) return;
    setAsking(true);
    try {
      await askQuestion(text);
    } finally {
      setAsking(false);
    }
  }

  // ---- 구매 금액 선그래프 (Chart.js, CDN으로 로드) ----
  useEffect(() => {
    if (!chartReady || !selectedCustomer || !canvasRef.current || !window.Chart) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    const purchases = selectedCustomer.purchases || [];
    const sorted = [...purchases].sort((a, b) => a.purchased_at.localeCompare(b.purchased_at));
    chartInstanceRef.current = new window.Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: sorted.map((p) => (p.purchased_at || '').slice(0, 10)),
        datasets: [{
          label: '구매 금액(원)',
          data: sorted.map((p) => p.unit_price_krw * p.quantity),
          borderColor: '#2f6f5e',
          backgroundColor: 'rgba(47,111,94,0.12)',
          tension: 0.25,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#2f6f5e',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString() + '원' } } },
      },
    });
  }, [selectedCustomer, chartReady]);

  function renderPurchaseTable(type) {
    const sort = purchaseSort[type];
    const rows = (selectedCustomer.purchases || [])
      .filter((p) => p.product_type === type)
      .map((p) => ({ ...p, amount: p.unit_price_krw * p.quantity }))
      .sort((a, b) => {
        const av = a[sort.key] ?? -Infinity;
        const bv = b[sort.key] ?? -Infinity;
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
        return sort.dir === 'desc' ? -cmp : cmp;
      });
    const arrow = (key) => (sort.key === key ? (sort.dir === 'desc' ? ' ▼' : ' ▲') : '');
    return (
      <table className="purchases" key={type}>
        <thead>
          <tr><th colSpan={5}>{type}</th></tr>
          <tr>
            <th className="sortable" onClick={() => sortPurchases(type, 'purchased_at')}>날짜{arrow('purchased_at')}</th>
            <th>상품</th>
            <th>수량</th>
            <th className="sortable" onClick={() => sortPurchases(type, 'amount')}>금액{arrow('amount')}</th>
            <th className="sortable" onClick={() => sortPurchases(type, 'rating')}>별점{arrow('rating')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={5}>구매 이력이 없습니다.</td></tr>
          ) : rows.map((p, i) => (
            <tr key={i}>
              <td>{(p.purchased_at || '').slice(0, 10)}</td>
              <td>{p.product_name}</td>
              <td>{p.quantity}개</td>
              <td>{p.amount.toLocaleString()}원</td>
              <td>
                {p.rating != null ? <span className="rating">별점 {p.rating}</span> : <span className="rating none">리뷰 없음</span>}
                {p.review_body && <div className="review-text">{p.review_body}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const filteredCustomers = searchKeyword.trim()
    ? customers.filter((c) => matchesSearch(c, searchKeyword.trim().toLowerCase()))
    : customers;
  const firstPet = selectedCustomer ? (selectedCustomer.pets || [])[0] : null;
  const totalSpent = selectedCustomer ? (selectedCustomer.purchases || []).reduce((sum, p) => sum + p.unit_price_krw * p.quantity, 0) : 0;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap" rel="stylesheet" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.1/chart.umd.min.js" strategy="afterInteractive" onLoad={() => setChartReady(true)} />

      {!isLoggedIn ? (
        <section id="loginGate">
          <div className="login-card">
            <div className="login-title">오늘 뭐멍냥</div>
            <div className="login-sub">관리자 대시보드</div>
            <form onSubmit={handleLoginSubmit} style={{ display: 'contents' }}>
              <label>관리자 비밀번호 <input name="password" type="password" placeholder="비밀번호" /></label>
              <button type="submit" disabled={loginSubmitting}>입장</button>
            </form>
            <p style={{ color: '#c0392b', fontSize: '13px', minHeight: '18px' }}>{loginError}</p>
          </div>
        </section>
      ) : (
        <div className="app">
          <div className="topbar">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="고객 이름 또는 ID 검색..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
            </div>
            <div className="topbar-title">고객 관리</div>
            <div className="view-switch">
              <button className={view === 'members' ? 'view-btn active' : 'view-btn'} onClick={() => setView('members')}>회원</button>
              <button className={view === 'verify' ? 'view-btn active' : 'view-btn'} onClick={() => setView('verify')}>검증</button>
              <button className={view === 'questions' ? 'view-btn active' : 'view-btn'} onClick={() => setView('questions')}>질문</button>
              <button className={view === 'system' ? 'view-btn active' : 'view-btn'} onClick={() => setView('system')}>시스템</button>
            </div>
            <div className="spacer"></div>
            <span className="whoami">관리자</span>
            <button className="logout-link" onClick={showLoginGate}>로그아웃</button>
            <button className="ai-btn" onClick={openAiPanel} disabled={!selectedCustomer}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2z" /><path d="M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6z" /></svg>
              AI 분석
            </button>
          </div>

          <div className="sidebar" hidden={view !== 'members'}>
            <div className="sidebar-label">고객 목록</div>
            <div>
              {filteredCustomers.length === 0 ? (
                <div className="no-result">검색 결과가 없습니다.</div>
              ) : filteredCustomers.map((c) => (
                <div
                  key={c.user_id}
                  className={selectedCustomer?.user_id === c.user_id ? 'customer-item active' : 'customer-item'}
                  onClick={() => selectCustomer(c.user_id)}
                >
                  <div className="avatar">{(c.name || '?')[0]}</div>
                  <div className="cust-meta">
                    <div className="cust-name">{c.name} <span className="cust-id">펫 {genderLabel(c.gender)} {ageLabel(c.birth_date)}</span></div>
                    <div className="cust-sub">{c.region ?? ''} · {petCategory(c.species)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="main" hidden={view !== 'members'}>
            {!selectedCustomer ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <div>왼쪽 목록에서 고객을 선택하면<br />상세정보와 구매 이력이 표시됩니다.</div>
              </div>
            ) : (
              <>
                <div className="profile-card">
                  <div className="profile-left">
                    <div className="avatar-lg">{petEmoji(firstPet?.animal_category)}</div>
                    <div>
                      <div className="profile-name">{selectedCustomer.name} <span className="cust-id">ID {selectedCustomer.user_id}</span></div>
                      <div className="profile-tags">
                        {(selectedCustomer.pets || []).length === 0 ? (
                          <span className="tag">등록된 반려동물 없음</span>
                        ) : selectedCustomer.pets.map((p, i) => (
                          <span className="tag" key={i}>{speciesLabel(p.animal_category)} · {p.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="profile-right">
                    <span>이메일</span><b>{selectedCustomer.email ?? '-'}</b>
                    <span>연락처</span><b>{selectedCustomer.phone ?? '-'}</b>
                    <span>반려동물 나이</span><b>{ageLabel(firstPet?.birth_date)}</b>
                    <span>가입일</span><b>{(selectedCustomer.created_at || '').slice(0, 10)}</b>
                    <span>구매 건수</span><b>{(selectedCustomer.purchases || []).length}건</b>
                    <span>총 구매액</span><b>{totalSpent.toLocaleString()}원</b>
                    <span>성별</span><b>{genderLabel(firstPet?.gender)}</b>
                    <span>체급</span><b>{sizeLabel(firstPet?.size)}</b>
                    <span>몸무게</span><b>{firstPet?.weight_kg != null ? `${firstPet.weight_kg}kg` : '-'}</b>
                    <span>중성화</span><b>{neuteredLabel(firstPet?.neutered)}</b>
                    <span>활동량</span><b>{activityLabel(firstPet?.activity_level)}</b>
                    <span>알러지</span><b>{firstPet?.allergies || '-'}</b>
                    <span>식성</span><b>{firstPet?.diet_note ?? '-'}</b>
                    <span>피부</span><b>{firstPet?.skin_note ?? '-'}</b>
                  </div>
                </div>

                <div className="section-title">구매 금액 추이</div>
                <div className="chart-card">
                  <canvas ref={canvasRef} height="90"></canvas>
                </div>

                <div className="section-title">구매 이력</div>
                {renderPurchaseTable('사료')}
                <div style={{ height: '16px' }}></div>
                {renderPurchaseTable('간식')}
              </>
            )}
          </div>

          <div className="full-view" hidden={view !== 'verify'}>
            <div className="section-title">임베딩 검증 결과</div>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>준비 중입니다. tests/eval/ 에 pytest 기반 검증이 붙으면 이 자리에 결과가 표시됩니다 (TODO.md 참고).</p>
          </div>

          <div className="full-view" hidden={view !== 'questions'}>
            <div className="section-title">고객 질문 기록</div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>customer 페이지 AI 질문(/ask/me)과 관리자 AI 분석 질문(/ask)이 여기 쌓인다 - 검색 후보(사료/간식)와 실제 답변을 대조해볼 수 있다.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questionsLoading ? (
                <div className="ai-loading" style={{ height: 'auto', padding: '10px 0' }}><div className="spinner"></div>불러오는 중...</div>
              ) : questionsError ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>불러오지 못했습니다.</p>
              ) : questions.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>아직 질문 기록이 없습니다.</p>
              ) : questions.map((q, i) => (
                <div className="question-item" key={i}>
                  <div className="q-meta">{q.time}{q.user_id != null ? ` · user_id ${q.user_id}` : ''}</div>
                  <div className="q-text">{q.user_query}</div>
                  <div className="q-label">추천 후보 top3</div>
                  <div className="q-candidates">
                    {(q.matched || []).slice(0, 3).map((m, j) => (
                      <span className={m.product_type === '간식' ? 'q-chip snack' : 'q-chip feed'} key={j}>
                        <span className="q-chip-type">{m.product_type || '?'}</span>{m.name} · {m.score.toFixed(3)}
                      </span>
                    ))}
                  </div>
                  <div className="q-label">AI 답변</div>
                  {q.ok ? <div className="q-answer">{q.answer}</div> : <div className="q-error">실패: {q.error || ''}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="full-view" hidden={view !== 'system'}>
            <div className="section-title">시스템 상태</div>
            <div className="status-dots" style={{ fontSize: '14px' }}>
              <span><span className="dot" style={{ background: systemStatus.db == null ? undefined : (systemStatus.db ? '#2e9e5b' : '#c0392b') }}></span>DB 연결</span>
              <span><span className="dot" style={{ background: systemStatus.api == null ? undefined : (systemStatus.api ? '#2e9e5b' : '#c0392b') }}></span>LLM API 연결</span>
            </div>
          </div>
        </div>
      )}

      <div className={aiPanelOpen ? 'overlay open' : 'overlay'} onClick={closeAllPanels}></div>
      <div className={aiPanelOpen ? 'ai-panel open' : 'ai-panel'}>
        <div className="ai-panel-header">
          <div>
            <h2>{selectedCustomer ? `${selectedCustomer.name} 고객 AI 분석` : 'AI 분석'}</h2>
            <p>구매 이력 기반 맞춤 전략 제안</p>
          </div>
          <button className="close-btn" onClick={closeAllPanels}>×</button>
        </div>
        <div className="ai-panel-body">
          <div className="ai-tabs">
            <button className={aiTab === 'recs' ? 'ai-tab active' : 'ai-tab'} onClick={() => setAiTab('recs')}>추천</button>
            <button className={aiTab === 'strategy' ? 'ai-tab active' : 'ai-tab'} onClick={() => setAiTab('strategy')}>전략</button>
            <button className={aiTab === 'ask' ? 'ai-tab active' : 'ai-tab'} onClick={() => setAiTab('ask')}>질문</button>
          </div>

          <div hidden={aiTab !== 'recs'}>
            {historyRecs === null ? (
              <div className="ai-loading" style={{ height: 'auto', padding: '10px 0' }}><div className="spinner"></div>구매 이력 확인 중...</div>
            ) : historyRecs.found.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>참고할 구매 후기가 없어 이력 기반 추천을 만들 수 없습니다.</p>
            ) : (
              <>
                <div className="section-title" style={{ fontSize: '13px' }}>구매 이력 기반 추천 <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(근거: &quot;{historyRecs.product_name}&quot; 후기)</span></div>
                {historyRecs.found.slice(0, 3).map((s, i) => (
                  <div className="ai-block" key={i}>
                    <h3><span className="dot"></span>{s.name} ({s.brand}) · 유사도 {s.score.toFixed(3)}</h3>
                    <div className="review-text">{s.review}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div hidden={aiTab !== 'strategy'}>
            <div className="section-title" style={{ fontSize: '13px' }}>판매전략 / CS 응대안</div>
            <button className="ai-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={loadStrategy} disabled={strategyLoading}>생성하기</button>
            <div style={{ marginTop: '14px' }}>
              {strategyLoading ? (
                <div className="ai-loading" style={{ height: 'auto', padding: '10px 0' }}><div className="spinner"></div>생성 중...</div>
              ) : strategyResult?.error ? (
                <p style={{ fontSize: '13px', color: '#c0392b' }}>{strategyResult.error}</p>
              ) : strategyResult ? (
                <>
                  <div className="answer-text" style={{ whiteSpace: 'pre-wrap' }}>{strategyResult.strategy}</div>
                  <div className="section-title" style={{ fontSize: '12px', marginTop: '12px' }}>근거</div>
                  {strategyResult.citations.map((c, i) => (
                    <div className="ai-block" key={i}>
                      <h3><span className="dot" style={{ background: c.verified ? '#2e9e5b' : '#c0392b' }}></span>구매#{c.purchase_id} · {c.verified ? '확인됨' : '확인 불가'}</h3>
                      <div className="review-text">{c.quote}</div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>

          <div hidden={aiTab !== 'ask'}>
            <form onSubmit={handleAskSubmit}>
              <input
                name="question" type="text" placeholder="예) 이 고객에게 어떤 사료가 맞을까요?"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13.5px', outline: 'none' }}
              />
              <button type="submit" className="ai-btn" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }} disabled={asking}>묻기</button>
            </form>
            <div style={{ color: '#c0392b', fontSize: '13px', marginTop: '10px' }}>{askError}</div>
            <div className="answer-text" style={{ marginTop: '14px', whiteSpace: 'pre-wrap' }}>{askAnswer}</div>
            <div style={{ color: '#c0392b', fontSize: '13px', marginTop: '10px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{askVerify}</div>

            <div className="scroll-block">
              {askFacts && (
                <>
                  <div className="section-title" style={{ fontSize: '12px', marginTop: '12px' }}>실제 구매 이력 (답변 검증 기준)</div>
                  <div className="review-text" style={{ whiteSpace: 'pre-wrap' }}>{askFacts}</div>
                </>
              )}
            </div>
            <div className="scroll-block">
              {askSources.length > 0 && (
                <>
                  <div className="section-title" style={{ fontSize: '13px', marginTop: '16px' }}>질문 기준 임베딩 검색 결과</div>
                  {askSources.slice(0, 3).map((s, i) => (
                    <div className="ai-block" key={i}>
                      <h3><span className="dot"></span>{s.name} ({s.brand}) · 유사도 {s.score.toFixed(3)}</h3>
                      <div className="review-text">{s.review}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

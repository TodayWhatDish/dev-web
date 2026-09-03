// 오늘뭐멍냥 고객페이지 - 회원가입만 실제 백엔드(POST /signup)에 붙였고, 나머지는 여전히 목업이다.
// 실제로 붙일 때는 각 자리에 남긴 주석의 엔드포인트로 갈아끼운다.
const $ = (sel) => document.querySelector(sel);

// admin.js와 같은 자리 - 프론트(3000)와 백엔드(8000)가 다른 오리진이라 직접 적는다.
const API = "http://localhost:8000";

let isLoggedIn = false;
let userToken = localStorage.getItem("userToken") || "";
let activeTab = 'pets';
// 실제로는 로그인한 고객의 pet 목록 (GET /api/customers/{id}).
// 재구조화안 그대로 보리/나비 두 마리를 기본값으로 채워둔다 - "없을 때" 문구는 아래서 같이 처리한다.
let pets = [
  { name: '보리', species: '강아지', emoji: '🐶' },
  { name: '나비', species: '고양이', emoji: '🐱' },
];
let purchases = []; // 실제로는 같은 응답의 purchases. 추천 카드에서 "구매하기"를 눌러야 채워진다
let quota = { used: 0, max: 5 };

// ---------------- 로그인/회원가입 ----------------
const loginBtn = $('#loginBtn');
const signupBtn = $('#signupBtn');
const loginOverlay = $('#loginOverlay');
const loginForm = $('#loginForm');
const loginError = $('#loginError');
const signupOverlay = $('#signupOverlay');
const signupForm = $('#signupForm');
const signupError = $('#signupError');

function setLoggedIn(loggedIn){
  isLoggedIn = loggedIn;
  loginBtn.textContent = isLoggedIn ? '로그아웃' : '로그인';
  signupBtn.hidden = isLoggedIn;
  renderAskGate();
}

loginBtn.addEventListener('click', () => {
  if (isLoggedIn){
    userToken = '';
    localStorage.removeItem('userToken');
    setLoggedIn(false);
    return;
  }
  loginError.textContent = '';
  loginForm.reset();
  loginOverlay.hidden = false;
});
$('#loginCancel').addEventListener('click', () => { loginOverlay.hidden = true; });

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const body = { email: $('#liEmail').value, password: $('#liPassword').value };
  const submitBtn = loginForm.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  let res;
  try {
    res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    loginError.textContent = '서버에 연결할 수 없습니다.';
    submitBtn.disabled = false;
    return;
  }
  submitBtn.disabled = false;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    loginError.textContent = err.detail || '로그인에 실패했습니다.';
    return;
  }

  const { access_token } = await res.json();
  userToken = access_token;
  localStorage.setItem('userToken', userToken);
  loginOverlay.hidden = true;
  setLoggedIn(true);
  loadMyPets();
});

const suAllergiesEl = $('#suPetAllergies');
let allergensLoaded = false;

// 알레르겐 목록은 GET /allergens에서 딱 한 번만 받아온다 - 회원가입 모달 열 때마다 다시 안 부른다
async function loadAllergenOptions(){
  if (allergensLoaded) return;
  try {
    const res = await fetch(`${API}/allergens`);
    if (!res.ok) return;
    const names = await res.json();
    suAllergiesEl.innerHTML = names.map((name) => `
      <label><input type="checkbox" value="${name}">${name}</label>`).join('');
    allergensLoaded = true;
  } catch { /* 목록을 못 받아도 나머지 가입 절차는 그대로 진행한다 */ }
}

signupBtn.addEventListener('click', () => {
  signupError.textContent = '';
  signupForm.reset();
  signupOverlay.hidden = false;
  loadAllergenOptions();
});
$('#signupCancel').addEventListener('click', () => { signupOverlay.hidden = true; });

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.textContent = '';

  const body = {
    email: $('#suEmail').value,
    password: $('#suPassword').value,
    name: $('#suName').value,
    phone: $('#suPhone').value || null,
    region: $('#suRegion').value || null,
    pet_name: $('#suPetName').value,
    pet_gender: $('#suPetGender').value || null,
    pet_birth_date: $('#suPetBirth').value || null,
    pet_weight_kg: $('#suPetWeight').value ? Number($('#suPetWeight').value) : null,
    pet_size: $('#suPetSize').value ? Number($('#suPetSize').value) : null,
    pet_allergies: [...suAllergiesEl.querySelectorAll('input:checked')].map((el) => el.value),
  };

  const submitBtn = signupForm.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  let res;
  try {
    res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    signupError.textContent = '서버에 연결할 수 없습니다.';
    submitBtn.disabled = false;
    return;
  }
  submitBtn.disabled = false;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // 409(이메일 중복) / 422(형식 오류) 둘 다 서버가 detail을 준다 (app/api/routes/auth.py)
    signupError.textContent = err.detail || '회원가입에 실패했습니다.';
    return;
  }

  const { access_token } = await res.json();
  userToken = access_token;
  localStorage.setItem('userToken', userToken);
  signupOverlay.hidden = true;
  setLoggedIn(true);
  loadMyPets();
});

// ---------------- 프로필 스트립: 우리 아이 / 구매 이력 탭 ----------------
const pillScrollEl = $('#pillScroll');
const reviewPanel = $('#reviewPanel');

function renderPillScroll(){
  if (activeTab === 'pets'){
    const petHtml = pets.length === 0
      ? `<span class="empty-msg">등록된 반려동물이 없어요.</span>`
      : pets.map(p => `<div class="pet-pill"><div class="avatar">${p.emoji}</div>${p.name}</div>`).join('');
    pillScrollEl.innerHTML = petHtml;
  } else {
    pillScrollEl.innerHTML = purchases.length === 0
      ? `<span class="empty-msg">아직 구매한 상품이 없어요.</span>`
      : purchases.map((h, i) => `
        <div class="purchase-pill">
          <span>${h.name}</span>
          ${h.reviewed
            ? `<span class="p-done">작성 완료</span>`
            : `<button type="button" class="p-review-btn" data-idx="${i}">리뷰 남기기</button>`}
        </div>`).join('');
  }
}
renderPillScroll();

// 로그인 직후/새로고침 복원 시 실제 DB의 pet 목록으로 pets를 채운다 (GET /me/pets)
async function loadMyPets(){
  try {
    const res = await fetch(`${API}/me/pets`, { headers: { Authorization: `Bearer ${userToken}` } });
    if (!res.ok) return;
    const rows = await res.json();
    pets = rows.map((p) => ({
      name: p.name,
      species: p.animal_category,
      emoji: p.animal_category === '고양이' ? '🐱' : '🐶',
    }));
    renderPillScroll();
  } catch { /* 실패해도 화면은 기존 값 그대로 둔다 */ }
}

// 탭/리뷰버튼은 매번 새로 그려지니 위임으로 한 번만 건다
pillScrollEl.addEventListener('click', (e) => {
  const idx = e.target.dataset.idx;
  if (idx !== undefined) openReviewPanel(Number(idx));
});

$('#tabSwitch').addEventListener('click', (e) => {
  const tab = e.target.dataset.tab;
  if (!tab) return;
  activeTab = tab;
  document.querySelectorAll('#tabSwitch button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  reviewPanel.hidden = true;
  renderPillScroll();
});

function openReviewPanel(i){
  reviewPanel.hidden = false;
  reviewPanel.innerHTML = `
    <textarea id="reviewText" placeholder="${purchases[i].name} 후기를 남겨주세요"></textarea>
    <button type="button" id="reviewSubmit">등록</button>`;
  $('#reviewSubmit').addEventListener('click', () => {
    // 실제로는 POST /api/purchases/{purchase_id}/review 로 review 테이블에 INSERT
    purchases[i].reviewed = true;
    reviewPanel.hidden = true;
    renderPillScroll();
  });
}

// ---------------- AI 질문창: 로그인 필요 + 일일 횟수 ----------------
// 질문 횟수(quota)는 여전히 화면에서만 세는 값이다 - 서버가 하루 횟수를 강제하지 않는다.
const askForm = $('#askForm');
const askInput = $('#askInput');
const askBtn = $('#askBtn');
const aiNote = $('#aiNote');
const aiQuota = $('#aiQuota');
const askAnswerEl = $('#askAnswer');
const askSourcesEl = $('#askSources');

function renderAskGate(){
  const exhausted = quota.used >= quota.max;
  askInput.disabled = !isLoggedIn || exhausted;
  askBtn.disabled = !isLoggedIn || exhausted;
  aiNote.classList.toggle('upsell', isLoggedIn && exhausted);
  aiNote.innerHTML = !isLoggedIn
    ? '로그인 후 이용할 수 있어요.'
    : exhausted
      ? '오늘 질문을 다 썼어요. <a href="#">멤버십으로 무제한 질문하기 →</a>'
      : '우리 아이 프로필 기준으로 답해드려요.';
}
function renderQuota(){
  aiQuota.textContent = `오늘 ${quota.max - quota.used}/${quota.max} 질문 가능`;
}
// 새로고침하면 isLoggedIn은 매번 false로 초기화되지만 userToken은 localStorage에 남아있다 -
// 토큰이 있으면 로그인 상태로 복원한다. (renderAskGate가 쓰는 askInput 등 const들이 여기서부터
// 정의돼 있으니 이 위로 옮기면 TDZ ReferenceError로 스크립트 전체가 멈춘다)
setLoggedIn(!!userToken);
if (userToken) loadMyPets();
renderQuota();

// 후보 리뷰 3개를 "실제 후기 근거"로 짧게 보여준다 - 사이트 소개 문구와 맞춘다
function renderAskSources(sources){
  if (!sources || !sources.length){ askSourcesEl.innerHTML = ''; return; }
  askSourcesEl.innerHTML = sources.slice(0, 3).map((s) => `
    <div class="ai-source-item">${s.name} (${s.brand}) · 유사도 ${s.score.toFixed(3)}</div>`).join('');
}

askForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!isLoggedIn || quota.used >= quota.max) return;
  const question = askInput.value.trim();
  if (!question) return;

  quota.used += 1;
  renderQuota();
  askInput.value = '';
  askBtn.disabled = true;
  askAnswerEl.hidden = false;
  askAnswerEl.textContent = '';
  askSourcesEl.innerHTML = '';

  try {
    const res = await fetch(`${API}/ask/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ user_query: question }),
    });
    if (res.status === 401){
      askAnswerEl.textContent = '로그인이 만료됐어요. 다시 로그인해주세요.';
      return;
    }
    if (!res.body){
      askAnswerEl.textContent = '응답을 받지 못했습니다.';
      return;
    }

    // NDJSON을 줄 단위로 읽는다 - 네트워크 조각이 줄 한가운데를 자를 수 있어 buffer가 꼭 필요하다
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true){
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines){
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.type === 'delta') askAnswerEl.textContent += chunk.text;
          else if (chunk.type === 'sources') renderAskSources(chunk.sources);
          else if (chunk.type === 'error') askAnswerEl.textContent = chunk.message;
        } catch { /* 깨진 줄 하나 때문에 전체를 멈추지 않는다 */ }
      }
    }
  } catch {
    askAnswerEl.textContent = '서버에 연결할 수 없습니다.';
  } finally {
    renderAskGate();
    document.querySelector('.cards').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// ---------------- 페이지 배경: Unsplash (백엔드가 GET /background로 키를 대신 들고 프록시) ----------------
// 카드 하나가 아니라 body 전체에 고정 배경으로 깐다. --cream 스크림을 이미지 위에 겹쳐서
// 기존 크림 배경 위 글자 대비는 그대로 두고 사진은 은은하게만 비치게 한다.
// 새로고침마다 부르면 무료 티어 요청 제한(시간당 50회)에 금방 걸리니 세션당 한 번만 부르고 캐싱한다.
(async function loadPageBackground(){
  const creditEl = $('#photoCredit');

  function applyBg({ url, credit_name, credit_link }){
    document.body.style.backgroundImage =
      `linear-gradient(rgba(250,246,238,.85), rgba(250,246,238,.85)), url(${url})`;
    creditEl.innerHTML = `Photo by <a href="${credit_link}?utm_source=today-mung-nyang&utm_medium=referral" target="_blank" rel="noopener">${credit_name}</a> on <a href="https://unsplash.com/?utm_source=today-mung-nyang&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`;
    creditEl.hidden = false;
  }

  const cached = sessionStorage.getItem('pageBg');
  if (cached){ applyBg(JSON.parse(cached)); return; }

  try {
    const res = await fetch(`${API}/background?query=dog,cat`);
    if (!res.ok) return; // 실패하면 CSS의 --cream 단색 배경 그대로 둔다
    const data = await res.json();
    sessionStorage.setItem('pageBg', JSON.stringify(data));
    applyBg(data);
  } catch { /* 서버 연결 안 돼도 배경색 폴백이 있으니 조용히 넘어간다 */ }
})();

// ---------------- 추천 카드: 구매하기 -> 구매 이력에 반영 ----------------
document.querySelectorAll('.btn-buy').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('bought')) return;
    const card = btn.closest('.card');
    const name = card.querySelector('.name').textContent;
    const price = Number(btn.dataset.price);
    // 실제로는 POST /api/purchases 로 purchase 테이블에 INSERT.
    purchases.push({ name, price, date: new Date().toISOString().slice(0, 10), reviewed: false });
    btn.textContent = '구매 완료 ✓';
    btn.classList.add('bought');
    if (activeTab === 'purchases') renderPillScroll();
  });
});

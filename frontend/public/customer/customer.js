// 오늘뭐멍냥 고객페이지 - 디자인 샘플. 전부 목업이다.
// 실제로 붙일 때는 각 자리에 남긴 주석의 엔드포인트로 갈아끼운다.
const $ = (sel) => document.querySelector(sel);

let isLoggedIn = false;
let activeTab = 'pets';
// 실제로는 로그인한 고객의 pet 목록 (GET /api/customers/{id}).
// 재구조화안 그대로 보리/나비 두 마리를 기본값으로 채워둔다 - "없을 때" 문구는 아래서 같이 처리한다.
let pets = [
  { name: '보리', species: '강아지', emoji: '🐶' },
  { name: '나비', species: '고양이', emoji: '🐱' },
];
let purchases = []; // 실제로는 같은 응답의 purchases. 추천 카드에서 "구매하기"를 눌러야 채워진다
let quota = { used: 0, max: 5 };

// ---------------- 로그인/회원가입 (목업 토글) ----------------
const loginBtn = $('#loginBtn');
const signupBtn = $('#signupBtn');
loginBtn.addEventListener('click', () => {
  isLoggedIn = !isLoggedIn;
  loginBtn.textContent = isLoggedIn ? '로그아웃' : '로그인';
  signupBtn.hidden = isLoggedIn;
  renderAskGate();
});

// ---------------- 프로필 스트립: 우리 아이 / 구매 이력 탭 ----------------
const pillScrollEl = $('#pillScroll');
const reviewPanel = $('#reviewPanel');

function renderPillScroll(){
  if (activeTab === 'pets'){
    const petHtml = pets.length === 0
      ? `<span class="empty-msg">등록된 반려동물이 없어요.</span>`
      : pets.map(p => `<div class="pet-pill"><div class="avatar">${p.emoji}</div>${p.name}</div>`).join('');
    pillScrollEl.innerHTML = petHtml + `<button type="button" class="pill-add" id="addPetBtn">+ 아이 추가</button>`;
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

// 탭/추가/리뷰버튼은 매번 새로 그려지니 위임으로 한 번만 건다
pillScrollEl.addEventListener('click', (e) => {
  if (e.target.id === 'addPetBtn'){
    // 실제로는 등록 폼/모달로 연결된다. 데모라 목업 데이터 한 마리를 바로 추가해 상태 전환만 보여준다.
    pets.push({ name: '뭉치', species: '강아지', emoji: '🐕' });
    renderPillScroll();
    return;
  }
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
const askForm = $('#askForm');
const askInput = $('#askInput');
const askBtn = $('#askBtn');
const aiNote = $('#aiNote');
const aiQuota = $('#aiQuota');

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
renderAskGate();
renderQuota();

askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isLoggedIn || quota.used >= quota.max) return;
  quota.used += 1;
  renderQuota();
  renderAskGate();
  // 실제로는 여기서 POST /ask 를 스트리밍으로 호출해 아래 추천 3장을 새로 채운다.
  document.querySelector('.cards').scrollIntoView({ behavior: 'smooth', block: 'center' });
  askInput.value = '';
});

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

import "./customer.css";

// 오늘뭐멍냥 고객페이지 - 정적 마크업만 옮긴 상태. 로그인/회원가입/탭 전환 같은 동작은
// 아직 안 붙였다 (customer.js 포팅은 다음 스텝).
export default function CustomerPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap"
        rel="stylesheet"
      />
      {/* Pretendard는 구글 폰트에 없는 서체라 family=Pretendard 로 걸면 조용히 로드가 안 된다.
          실제 배포하는 곳(jsdelivr, orioncactus/pretendard)에서 받는다. */}
      <link
        rel="stylesheet"
        as="style"
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
      />

      <div className="page">
        <header>
          <div className="logo">
            <div className="logo-mark">🐾</div>
            오늘뭐멍냥
          </div>
          <div className="auth-buttons">
            <a className="admin-link" href="/admin">관리자페이지</a>
            <button type="button" className="btn btn-ghost" id="loginBtn">로그인</button>
            <button type="button" className="btn btn-solid" id="signupBtn">회원가입</button>
          </div>
        </header>

        <div className="profile-strip">
          <div className="pill-scroll" id="pillScroll"></div>
          <div className="tab-switch" id="tabSwitch">
            <button type="button" className="active" data-tab="pets">우리 아이</button>
            <button type="button" data-tab="purchases">구매 이력</button>
          </div>
        </div>

        <div className="review-panel" id="reviewPanel" hidden></div>

        <div className="hero">
          <div className="hero-copy">
            <div className="eyebrow">TODAY'S PICK · 2026</div>
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
                <span className="ai-quota" id="aiQuota">오늘 5/5 질문 가능</span>
              </div>
              <form className="ai-input-row" id="askForm">
                <input type="text" id="askInput" placeholder="예) 알레르기 없는 소형견 사료 추천해줘" disabled />
                <button type="submit" id="askBtn" disabled>질문</button>
              </form>
              <div className="ai-note" id="aiNote">로그인 후 이용할 수 있어요.</div>
              <div className="ai-answer" id="askAnswer" hidden></div>
              <div className="ai-sources" id="askSources"></div>
            </div>
          </div>
        </div>

        <div className="section-title">
          <h2>오늘의 추천</h2>
          <span>우리 아이 프로필 기준 · 실제 후기 근거</span>
        </div>
        <div className="cards">
          <div className="card">
            <div className="card-thumb">🍖</div>
            <div className="brand">그레인프리 키친</div>
            <div className="name">연어 &amp; 고구마 건식 사료</div>
            <div className="review">"소형견인데도 알갱이가 작아서 잘 먹어요. 냄새도 안 나고 변 상태도 좋아졌어요."</div>
            <div className="card-foot">
              <span className="price">32,900원</span>
              <span className="badge-score">유사도 0.91</span>
            </div>
            <button type="button" className="btn-buy" data-price="32900">구매하기</button>
          </div>
          <div className="card">
            <div className="card-thumb">🐟</div>
            <div className="brand">퓨어펫</div>
            <div className="name">화식 트릿 (닭가슴살)</div>
            <div className="review">"산책 훈련용으로 딱이에요. 크기도 작고 손에 안 묻어서 편해요."</div>
            <div className="card-foot">
              <span className="price">9,900원</span>
              <span className="badge-score">유사도 0.88</span>
            </div>
            <button type="button" className="btn-buy" data-price="9900">구매하기</button>
          </div>
          <div className="card">
            <div className="card-thumb">🥕</div>
            <div className="brand">냥이부엌</div>
            <div className="name">수제 동결건조 큐브</div>
            <div className="review">"알레르기 있는 고양이인데 반응 하나도 없었어요. 향도 좋아하네요."</div>
            <div className="card-foot">
              <span className="price">14,500원</span>
              <span className="badge-score">유사도 0.85</span>
            </div>
            <button type="button" className="btn-buy" data-price="14500">구매하기</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="loginOverlay" hidden>
        <div className="modal-box">
          <h3>로그인</h3>
          <form id="loginForm">
            <input type="email" id="liEmail" placeholder="이메일" required />
            <input type="password" id="liPassword" placeholder="비밀번호" required />
            <div className="modal-error" id="loginError"></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" id="loginCancel">취소</button>
              <button type="submit" className="btn btn-solid">로그인</button>
            </div>
          </form>
        </div>
      </div>

      <div className="modal-overlay" id="signupOverlay" hidden>
        <div className="modal-box">
          <h3>회원가입</h3>
          <form id="signupForm">
            <input type="email" id="suEmail" placeholder="이메일" required />
            <input type="password" id="suPassword" placeholder="비밀번호" required />
            <input type="text" id="suName" placeholder="이름" required />
            <input type="tel" id="suPhone" placeholder="연락처 (선택)" />
            <input type="text" id="suRegion" placeholder="지역 (선택)" />
            <hr />
            <input type="text" id="suPetName" placeholder="반려동물 이름" required />

            <div className="qa-block">
              <span className="qa-label">강아지인가요, 고양이인가요?</span>
              <div className="radio-row">
                <label><input type="radio" name="suPetSpecies" value="개" defaultChecked /> 강아지</label>
                <label><input type="radio" name="suPetSpecies" value="고양이" /> 고양이</label>
              </div>
            </div>

            <div className="qa-block">
              <span className="qa-label">성별이 어떻게 되나요? (선택)</span>
              <select id="suPetGender">
                <option value="">선택 안 함</option>
                <option value="M">수컷</option>
                <option value="F">암컷</option>
              </select>
            </div>

            <div className="qa-block">
              <span className="qa-label">태어난 날짜는 언제인가요? (선택)</span>
              <input type="date" id="suPetBirth" />
            </div>

            <div className="qa-block">
              <span className="qa-label">체중은 몇 kg인가요? (선택)</span>
              <input type="number" id="suPetWeight" placeholder="예: 4.5" step="0.1" min="0" />
            </div>

            <div className="qa-block">
              <span className="qa-label">체구는 어느 정도인가요? (선택)</span>
              <select id="suPetSize">
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
              <select id="suPetActivity">
                <option value="">선택 안 함</option>
                <option value="1">적음</option>
                <option value="2">보통</option>
                <option value="3">많음</option>
              </select>
            </div>

            <div className="qa-block">
              <span className="qa-label">먹는 걸 밝히거나 입이 까다로운 편인가요? (선택)</span>
              <input type="text" id="suDietNote" placeholder="예: 식탐이 많아요 / 입이 까다로워요" />
            </div>

            <div className="qa-block">
              <span className="qa-label">피부 상태는 어떤가요? (선택)</span>
              <input type="text" id="suSkinNote" placeholder="예: 피부가 예민한 편이에요" />
            </div>

            <div className="qa-block">
              <span className="qa-label">알러지가 있나요? 있는 항목을 모두 체크해주세요 (선택)</span>
              <div id="suPetAllergies" className="allergy-list"></div>
            </div>

            <div className="modal-error" id="signupError"></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" id="signupCancel">취소</button>
              <button type="submit" className="btn btn-solid">가입하기</button>
            </div>
          </form>
        </div>
      </div>

      <div className="photo-credit" id="photoCredit" hidden></div>
    </>
  );
}

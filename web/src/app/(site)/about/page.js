import Link from "next/link";

export const metadata = {
  title: "소개 — 오늘뭐멍냥",
  description: "오늘뭐멍냥이 왜 후기에서 근거를 찾는 방식을 택했는지 설명합니다.",
};

export default function About() {
  return (
    <main>
      <section className="field field-cream">
        <div className="wrap">
          <h1 style={{ fontSize: "clamp(36px, 5.6vw, 76px)", marginBottom: 24 }}>
            사료 코너 앞에서
            <br />
            10분씩 서 있어 본 사람들이
            <br />
            만들고 있습니다
          </h1>
          <p className="lede">
            성분표를 읽어도 우리 아이한테 맞는지는 안 나옵니다. 별점 4.8은 누구의 4.8인지 모릅니다. 결국 검색창에
            품종과 증상을 넣고 남의 글을 뒤지게 됩니다. 그 일을 대신하려고 만들었습니다.
          </p>
        </div>
      </section>

      <section className="field field-cocoa">
        <div className="wrap">
          <div className="benefit">
            <div>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", marginBottom: 16 }}>
                지어낸 문장보다 실제로 쓰인 문장
              </h2>
              <p className="lede">
                언어 모델은 그럴듯한 문장을 잘 만듭니다. 그런데 사료 추천에서 필요한 건 그럴듯함이 아니라, 실제로
                누군가 겪은 일입니다. 그래서 모델이 아는 걸 말하게 두지 않고, 후기에서 찾은 문장만 근거로 쓰게
                했습니다.
              </p>
            </div>
            <div className="benefit-art">
              <img className="photo" src="/pets/cat-2.jpg" alt="앉아 있는 줄무늬 아기 고양이" />
            </div>
          </div>

          <div className="benefit">
            <div>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", marginBottom: 16 }}>개와 고양이만 봅니다</h2>
              <p className="lede">
                품종, 체형, 알레르기, 영양 기준이 동물마다 다릅니다. 새와 햄스터까지 아는 척하면 개와 고양이 답도
                같이 부정확해집니다. 잘 아는 범위만 다루기로 했습니다.
              </p>
            </div>
            <div className="benefit-art">
              <img className="photo" src="/pets/dog-1.jpg" alt="고개를 든 골든 리트리버" />
            </div>
          </div>
        </div>
      </section>

      <section className="field field-butter">
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(28px, 3.6vw, 48px)", marginBottom: 20 }}>지금 어디까지 왔나</h2>
          <p className="lede" style={{ marginBottom: 14 }}>
            추천을 만들고 근거를 붙이고 다른 모델로 검사하는 과정은 이미 돌아갑니다. 다만 아직 실제 이용자와 실제
            후기가 없어서, 지금 보시는 후기와 추천 예시는 전부 저희가 만든 샘플 데이터입니다.
          </p>
          <p className="lede">
            실제 후기가 쌓이기 전까지는 이 사실을 계속 적어 두겠습니다. 근거를 강조하는 서비스가 첫 화면부터
            지어낸 숫자를 걸어 두면 앞뒤가 맞지 않으니까요.
          </p>
          <div style={{ marginTop: 40 }}>
            <Link href="/contact" className="btn">
              궁금한 점 물어보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

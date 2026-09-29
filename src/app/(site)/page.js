import Link from "next/link";

const BENEFITS = [
  {
    title: "우리 아이 이야기를 그대로 적으면 됩니다",
    body: "체중 몇 킬로, 알레르기 있음 같은 항목을 고를 필요가 없습니다. “세 살 말티즈인데 닭고기만 먹으면 긁어요”라고 쓰시면, 그 문장을 그대로 읽고 찾습니다.",
    photo: "/pets/dog-1.jpg",
    alt: "고개를 든 골든 리트리버",
  },
  {
    title: "왜 그 사료인지 후기로 보여 드립니다",
    body: "추천과 함께 근거가 된 후기를 같이 보여 드립니다. 비슷한 아이를 키우는 보호자가 실제로 무엇을 겪었는지 읽고 나서 결정하시면 됩니다.",
    photo: "/pets/cat-1.jpg",
    alt: "카메라를 바라보는 아기 고양이",
  },
  {
    title: "답변을 다른 모델이 한 번 더 검사합니다",
    body: "답을 쓴 모델과 검사하는 모델을 다르게 둡니다. 자기가 쓴 답을 자기가 채점하지 않게 해서, 근거 없는 말이 그대로 나가지 않도록 막습니다.",
    photo: "/pets/dog-2.jpg",
    alt: "울타리 사이로 내다보는 코기 강아지",
  },
];

const SAMPLES = [
  {
    text: "“닭고기만 먹으면 발을 핥아서 바꿨는데, 연어로 바꾸고 2주쯤 지나니 핥는 게 확 줄었어요.”",
    who: "말티즈 · 3살",
    photo: "/pets/dog-2.jpg",
  },
  {
    text: "“신장 수치 때문에 처방식으로 갈아탔어요. 알갱이가 작아서 우리 애가 뱉지 않고 잘 먹습니다.”",
    who: "코숏 · 9살",
    photo: "/pets/cat-3.jpg",
  },
  {
    text: "“간식 바꾸고 나서 변이 무른 게 없어졌어요. 성분표에 곡물이 없는 걸로 골랐습니다.”",
    who: "포메라니안 · 5살",
    photo: "/pets/cat-4.jpg",
  },
];

const FAQ = [
  {
    q: "어떤 동물을 봐 주나요?",
    a: "개와 고양이만 봅니다. 품종과 체형, 알레르기 기준이 동물마다 완전히 달라서, 잘 모르는 동물까지 아는 척하지 않으려고 범위를 좁혔습니다.",
  },
  {
    q: "지금 보이는 후기는 실제 후기인가요?",
    a: "아닙니다. 서비스를 준비하는 단계라 실제 이용자 후기가 아직 없습니다. 이 화면의 후기와 추천 예시는 저희가 만든 샘플 데이터이며, 실제 후기가 쌓이기 전까지는 그렇다고 계속 적어 두겠습니다.",
  },
  {
    q: "추천이 틀리면 어떻게 하나요?",
    a: "근거가 된 후기를 항상 같이 보여 드립니다. 읽어 보시고 우리 아이와 상황이 다르다고 판단되면 그 추천은 버리시면 됩니다. 근거를 댈 수 없을 때는 추천을 만들지 않습니다.",
  },
  {
    q: "돈이 드나요?",
    a: "가격은 아직 정하지 않았습니다. 정해지면 이 페이지에 먼저 적겠습니다.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <h1 className="hero-title">
            우리 아이 이야기를 적으면,
            <br />
            <em>그 이야기에 맞는 후기</em>를<br />
            찾아 드립니다
          </h1>
          <p className="hero-lede">
            개와 고양이의 사료와 간식을, 비슷한 상황을 겪은 보호자들의 후기에서 찾아 근거와 함께 골라 드립니다.
          </p>
          <Link href="/customer" className="btn">
            오늘의 추천 받기
          </Link>
        </div>

        <div className="hero-art">
          <img className="paw paw-a" src="/dog-mark.png" alt="" />
          <img className="photo" src="/pets/dog-1.jpg" alt="고개를 든 골든 리트리버" />
          <img className="photo" src="/pets/cat-1.jpg" alt="카메라를 바라보는 아기 고양이" />
          <img className="photo" src="/pets/cat-2.jpg" alt="앉아 있는 줄무늬 아기 고양이" />
          <img className="photo" src="/pets/dog-2.jpg" alt="울타리 사이로 내다보는 코기 강아지" />
          <img className="paw paw-b" src="/dog-mark.png" alt="" />
        </div>
      </section>

      <section className="field field-butter">
        <div className="wrap">
          {BENEFITS.map((b) => (
            <article className="benefit" key={b.title}>
              <div>
                <h3>{b.title}</h3>
                <p className="lede">{b.body}</p>
              </div>
              <div className="benefit-art">
                <img className="photo" src={b.photo} alt={b.alt} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="field field-cocoa">
        <div className="wrap">
          <span className="note">실제 이용자 후기가 아닙니다 · 샘플 데이터로 만든 예시입니다</span>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 54px)" }}>추천은 이런 문장에서 나옵니다</h2>
          <div className="quotes">
            {SAMPLES.map((s) => (
              <figure className="quote" key={s.who}>
                <p>{s.text}</p>
                <figcaption className="quote-who">
                  <img src={s.photo} alt="" />
                  {s.who}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="field field-cream">
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(30px, 4vw, 54px)", marginBottom: 28 }}>자주 묻는 질문</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

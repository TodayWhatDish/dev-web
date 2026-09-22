import Link from "next/link";

export const metadata = {
  title: "서비스 — 오늘뭐멍냥",
  description: "우리 아이 이야기를 적으면 후기에서 근거를 찾아 사료와 간식을 골라 드리는 방식을 설명합니다.",
};

const STEPS = [
  {
    title: "적으세요",
    photo: "/pets/dog-1.jpg",
    alt: "고개를 든 골든 리트리버",
    body: "“세 살 말티즈인데 닭고기만 먹으면 긁어요” 처럼, 평소 쓰시는 말 그대로 적으면 됩니다. 항목을 고르거나 체크박스를 누를 필요가 없습니다.",
  },
  {
    title: "찾습니다",
    photo: "/pets/cat-3.jpg",
    alt: "창가에 앉은 고양이",
    body: "비슷한 상황의 보호자가 남긴 후기를 찾습니다. 품종과 체형, 알레르기, 나이가 가까운 쪽을 먼저 봅니다.",
  },
  {
    title: "근거와 함께 답합니다",
    photo: "/pets/cat-1.jpg",
    alt: "카메라를 바라보는 아기 고양이",
    body: "찾은 후기를 근거로 사료와 간식을 추천하고, 그 후기를 같이 보여 드립니다. 근거를 댈 수 없으면 추천을 만들지 않습니다.",
  },
  {
    title: "다른 모델이 검사합니다",
    photo: "/pets/cat-4.jpg",
    alt: "카메라를 응시하는 고양이",
    body: "답을 쓴 모델과 검사하는 모델을 다르게 둡니다. 자기 답을 자기가 채점하지 않게 해서, 후기에 없는 말이 섞이면 걸러냅니다.",
  },
];

export default function Service() {
  return (
    <main>
      <section className="field field-cream">
        <div className="wrap">
          <h1 style={{ fontSize: "clamp(36px, 5.6vw, 76px)", marginBottom: 22 }}>
            고르는 일을 대신하지 않습니다.
            <br />
            고를 수 있게 근거를 드립니다.
          </h1>
          <p className="lede">
            성분표와 별점만으로는 “우리 아이한테 맞나”를 알 수 없습니다. 그래서 같은 고민을 먼저 한 보호자들이 쓴
            문장을 찾아 드립니다.
          </p>
        </div>
      </section>

      <section className="field field-caramel">
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(30px, 4vw, 54px)", marginBottom: 40 }}>네 단계로 움직입니다</h2>
          {STEPS.map((s, i) => (
            <article className="benefit" key={s.title}>
              <div>
                <span className="step-no">{i + 1}</span>
                <h3>{s.title}</h3>
                <p className="lede">{s.body}</p>
              </div>
              <div className="benefit-art">
                <img className="photo" src={s.photo} alt={s.alt} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="field field-butter">
        <div className="wrap">
          <h2 style={{ fontSize: "clamp(28px, 3.6vw, 48px)", marginBottom: 20 }}>하지 않는 것</h2>
          <p className="lede" style={{ marginBottom: 14 }}>
            검사 키트를 팔지 않습니다. 건강 진단을 흉내 내지 않습니다. 개와 고양이 말고 다른 동물은 보지 않습니다.
            진료가 필요한 증상은 병원으로 가시라고 말씀드립니다.
          </p>
          <p className="lede">
            후기에서 근거를 찾지 못하면 “모르겠습니다”라고 답합니다. 그럴듯한 문장을 지어내는 쪽이 더 쉽지만, 그건
            도움이 되지 않습니다.
          </p>
          <div style={{ marginTop: 40 }}>
            <Link href="/customer" className="btn">
              오늘의 추천 받기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

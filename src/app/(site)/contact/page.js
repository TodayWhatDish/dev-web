import ContactForm from "./ContactForm";

export const metadata = {
  title: "문의 — 오늘뭐멍냥",
  description: "오늘뭐멍냥에 궁금한 점을 보내실 수 있습니다.",
};

export default function Contact() {
  return (
    <main>
      <section className="field field-cream">
        <div className="wrap contact-grid">
          <div>
            <h1 style={{ fontSize: "clamp(36px, 5.6vw, 68px)", marginBottom: 22 }}>
              무엇이든 물어보세요
            </h1>
            <p className="lede">
              서비스가 궁금하시거나, 우리 아이 상황이 여기서 다뤄지는지 확인하고 싶으시면 적어 보내 주세요.
              읽고 답장드립니다.
            </p>
            <ContactForm />
          </div>

          <div className="contact-art">
            <img className="paw paw-b" src="/dog-mark.png" alt="" />
            <img className="photo" src="/pets/cat-2.jpg" alt="앉아 있는 줄무늬 아기 고양이" />
            <img className="photo" src="/pets/dog-2.jpg" alt="울타리 사이로 내다보는 코기 강아지" />
          </div>
        </div>
      </section>
    </main>
  );
}

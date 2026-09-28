import Link from "next/link";
import "./site.css";

export const metadata = {
  title: "오늘뭐멍냥 — 후기로 고르는 우리 아이 사료·간식",
  description:
    "우리 아이 이야기를 그대로 적으면, 비슷한 상황의 보호자들이 남긴 후기를 찾아 근거와 함께 사료와 간식을 골라 드립니다.",
};

export default function SiteLayout({ children }) {
  return (
    <div className="site">
      <header className="nav">
        <Link href="/" className="nav-brand">
          <img src="/dog-mark.png" alt="" />
          오늘뭐멍냥
        </Link>
        <nav className="nav-links">
          <Link href="/">홈</Link>
          <Link href="/service">서비스</Link>
          <Link href="/about">소개</Link>
          <Link href="/contact">문의</Link>
        </nav>
      </header>

      {children}

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).flatMap((_, block) =>
            ["우리 아이 이야기를 그대로", "후기에서 찾은 근거", "개와 고양이 전용", "오늘 뭐 먹지?"].flatMap((t) => [
              <span key={`${block}-${t}`}>{t}</span>,
              <img key={`${block}-${t}-m`} src="/dog-mark.png" alt="" />,
            ])
          )}
        </div>
      </div>

      <footer className="foot">
        <div className="foot-top">
          <strong style={{ fontFamily: "Jua, sans-serif", fontSize: 20 }}>오늘뭐멍냥</strong>
          <nav className="nav-links">
            <Link href="/service">서비스</Link>
            <Link href="/about">소개</Link>
            <Link href="/contact">문의</Link>
          </nav>
        </div>
        <p style={{ marginTop: 24 }}>
          개와 고양이를 위한 사료·간식 추천 서비스입니다. 현재 준비 중이며, 화면에 보이는 후기와 추천 예시는
          모두 샘플 데이터로 만든 것입니다.
        </p>
      </footer>
    </div>
  );
}

import "./globals.css";

export const metadata = {
  title: "오늘뭐멍냥",
  description: "반려동물 사료/간식 추천 서비스 오늘뭐멍냥",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

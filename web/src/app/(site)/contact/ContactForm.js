"use client";

import { useState } from "react";

// TODO: 실제 받는 주소로 교체해야 합니다. 아직 주소를 받지 못해 자리표시자입니다.
const TO = "hello@example.com";

export default function ContactForm() {
  const [error, setError] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = f.get("name").trim();
    const message = f.get("message").trim();
    if (!name || !message) {
      setError("이름과 내용을 적어 주세요.");
      return;
    }
    setError("");
    const body = `${message}\n\n---\n보낸 사람: ${name}\n회신 주소: ${f.get("email").trim() || "(적지 않음)"}`;
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(
      `[오늘뭐멍냥 문의] ${name}님`
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <label>
        이름
        <input name="name" type="text" placeholder="홍길동" autoComplete="name" />
      </label>
      <label>
        회신받을 메일 주소 (선택)
        <input name="email" type="email" placeholder="me@example.com" autoComplete="email" />
      </label>
      <label>
        내용
        <textarea name="message" placeholder="궁금한 점이나 하고 싶은 말을 적어 주세요." />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div>
        <button type="submit" className="btn btn-pink">
          메일 보내기
        </button>
      </div>
      <p style={{ fontSize: 14, color: "var(--cocoa-soft)", margin: 0 }}>
        누르면 쓰시는 메일 앱이 열리고, 위 내용이 채워진 상태로 뜹니다.
      </p>
    </form>
  );
}

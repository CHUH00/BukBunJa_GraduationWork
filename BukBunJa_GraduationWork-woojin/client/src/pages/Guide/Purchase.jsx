import Placeholder from "../../components/Placeholder/Placeholder";

// client/src/pages/Guide/Purchase.jsx
export default function Purchase() {
  return (
    <div style={{ padding: "20px", background: "#ffffffff", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
      <h1>구매하기</h1>

      <section style={{ marginTop: "20px" }}>
        <h2>📍 어디서 살 수 있나요?</h2>
        <ul>
          <li>오프라인: 전국 편의점, 복권방, 가판대</li>
          <li>
            온라인:{" "}
            <a href="https://dhlottery.co.kr" target="_blank" rel="noopener noreferrer">
              동행복권 공식 홈페이지
            </a>
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>🕒 판매 시간</h2>
        <ul>
          <li>매일 06:00 ~ 24:00 (연중무휴)</li>
          <li>토요일 추첨일은 20:00까지 구매 가능</li>
          <li>추첨일 20시 이후 ~ 일요일 06시까지는 판매 중단</li>
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>🔑 온라인 구매 조건</h2>
        <ul>
          <li>만 19세 이상 성인만 가능</li>
          <li>동행복권 홈페이지 회원가입 필요</li>
          <li>본인 명의 계좌 및 휴대폰 인증 필수</li>
        </ul>
      </section>

      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 더 알아보기:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=buyLotto" target="_blank" rel="noopener noreferrer">
            구매 페이지 바로가기
          </a>
        </p>
      </footer>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import Placeholder from "../../components/Placeholder/Placeholder";

export default function Purchase() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", backgroundColor: "#fdecee", borderRadius: "12px", minHeight: "100vh", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "40px", fontWeight:800 }}>구매하기</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginTop: "20px" }}>
        <section style={{ background: "#f9f9f9", padding: 20, borderRadius: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontWeight: "bold" }}>📍 어디서 살 수 있나요?</h2>
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

        <section style={{ background: "#f9f9f9", padding: 20, borderRadius: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontWeight: "bold" }}>🕒 판매 시간</h2>
          <ul>
            <li>매일 06:00 ~ 24:00 (연중무휴)</li>
            <li>토요일 추첨일은 20:00까지 구매 가능</li>
            <li>추첨일 20시 이후 ~ 일요일 06시까지는 판매 중단</li>
          </ul>
        </section>

        <section style={{ background: "#f9f9f9", padding: 20, borderRadius: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontWeight: "bold" }}>🔑 온라인 구매 조건</h2>
          <ul>
            <li>만 19세 이상 성인만 가능</li>
            <li>동행복권 홈페이지 회원가입 필요</li>
            <li>본인 명의 계좌 및 휴대폰 인증 필수</li>
          </ul>
        </section>
      </div>
      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 더 알아보기:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=buyLotto" target="_blank" rel="noopener noreferrer">
            구매 페이지 바로가기
          </a>
        </p>
      </footer>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer", marginRight: 10 }}
          onClick={() => navigate("/guide/intro")}
        >
          ◀ 이전
        </button>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer" }}
          onClick={() => navigate("/guide/how-to-buy")}
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
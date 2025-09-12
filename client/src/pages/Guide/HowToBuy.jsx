import { useNavigate } from "react-router-dom";
import Placeholder from "../../components/Placeholder/Placeholder";

export default function HowToBuy() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", backgroundColor: "#fdecee", borderRadius: "12px", minHeight: "100vh", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "40px", fontWeight:800 }}>구매 방법</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
        <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>💡 구매 절차 요약</h2>
          <ol>
            <li>복권 종류 선택: 로또 6/45</li>
            <li>번호 선택 방식: 자동 / 반자동 / 수동</li>
            <li>구매 수량 선택: 1게임~5게임까지 선택 가능</li>
            <li>결제 및 발행</li>
          </ol>
        </section>

        <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>🏪 오프라인 구매</h2>
          <ul>
            <li>복권용지에 직접 번호 선택</li>
            <li>단말기로 발행 후 영수증 형태로 수령</li>
            <li>판매점 직원 요청 시 자동 발행 가능</li>
          </ul>
        </section>

        <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>💻 온라인 구매</h2>
          <ul>
            <li>
              <a href="https://dhlottery.co.kr/gameInfo.do?method=buyLotto" target="_blank" rel="noopener noreferrer">
                구매하기 페이지 접속
              </a>
            </li>
            <li>로그인 → 번호 선택 → 결제 → 마이페이지에서 복권 확인</li>
          </ul>
        </section>
      </div>

      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 더 알아보기:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=buyInfo" target="_blank" rel="noopener noreferrer">
            구매방법 안내 페이지
          </a>
        </p>
      </footer>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer", marginRight: 10 }}
          onClick={() => navigate("/guide/purchase")}
        >
          ◀ 이전
        </button>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer" }}
          onClick={() => navigate("/guide/draw-info")}
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import Placeholder from "../../components/Placeholder/Placeholder";

// client/src/pages/Guide/DrawInfo.jsx
export default function DrawInfo() {
  const navigate = useNavigate();

  return (
    <>
      <div style={{ padding: "20px", background: "#ffffffff", borderRadius: "12px",boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <h1>추첨 안내</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
          <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontWeight: "bold" }}>🗓️ 추첨 일정 및 방송</h2>
            <ul>
              <li>매주 토요일 오후 8시 35분</li>
              <li>MBC 방송국 스튜디오에서 생방송 진행</li>
            </ul>
          </section>

          <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontWeight: "bold" }}>🎲 추첨 방식</h2>
            <ul>
              <li>공인된 추첨기계로 1~45 중 무작위 번호 6개 + 보너스 번호 1개 추출</li>
              <li>공정성과 투명성을 위해 생방송 및 공개검증 진행</li>
            </ul>
          </section>

          <section style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontWeight: "bold" }}>📺 당첨 결과 확인 방법</h2>
            <ul>
              <li>MBC 생방송</li>
              <li>판매점 또는 동행복권 홈페이지 마이페이지</li>
            </ul>
          </section>
        </div>

        <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
          <p>
            👉 참고:{" "}
            <a href="https://dhlottery.co.kr/gameInfo.do?method=lotMethod" target="_blank" rel="noopener noreferrer">
              추첨안내 바로가기
            </a>
          </p>
        </footer>
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer", marginRight: 10 }}
          onClick={() => navigate("/guide/how-to-buy")}
        >
          ◀ 이전
        </button>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer" }}
          onClick={() => {
            alert("튜토리얼 끝!\n축하합니다! 모든 로또 가이드를 완료했습니다.\n이제 본격적으로 로또를 즐겨보세요!");
            navigate("/");
          }}
        >
          ✓ 완료
        </button>
      </div>
    </>
  );
}
import { useNavigate } from "react-router-dom";
import Placeholder from "../../components/Placeholder/Placeholder";

export default function LottoIntro() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", backgroundColor: "#fdecee", borderRadius: "12px", minHeight: "100vh", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "40px", fontWeight:800 }}>로또 6/45 소개</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>🎯 로또 6/45란?</h2>
          <ul>
            <li>45개의 숫자 중 6개를 선택해 당첨을 노리는 대표적인 온라인 복권</li>
            <li>전국의 편의점, 복권방, 가판대, 동행복권 홈페이지에서 구매 가능</li>
          </ul>
        </div>

        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>💻 온라인 복권이란?</h2>
          <ul>
            <li>중앙전산시스템과 연결된 단말기를 통해 실시간으로 발행·판매되는 복권</li>
            <li>인터넷복권과는 다른 개념으로, 오프라인 구매도 포함</li>
          </ul>
        </div>

        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>🔢 번호 선택 방식</h2>
          <ul>
            <li>자동: 6개 번호 무작위 자동 선택</li>
            <li>반자동: 일부 번호 직접 선택, 나머지는 자동</li>
            <li>수동: 6개 번호 모두 직접 선택</li>
          </ul>
        </div>

        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <h2>💰 당첨금 구성</h2>
          <ul>
            <li>판매량에 따라 1등 당첨금이 달라짐</li>
            <li>1등 당첨자가 없으면 최대 2회까지 당첨금이 이월됩니다.</li>
          </ul>
        </div>
      </div>

      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 더 알아보기:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=gameMethod" target="_blank" rel="noopener noreferrer">
            로또 6/45 소개 페이지 바로가기
          </a>
        </p>
      </footer>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#7a0e0e", color: "#fff", border: "none", cursor: "pointer" }}
          onClick={() => navigate("/guide/purchase")}
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
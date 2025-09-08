import Placeholder from "../../components/Placeholder/Placeholder";

// client/src/pages/Guide/DrawInfo.jsx
export default function DrawInfo() {
  return (
    <div style={{ padding: "20px", background: "#ffffffff", borderRadius: "12px",boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
      <h1>추첨 안내</h1>

      <section style={{ marginTop: "20px" }}>
        <h2>🗓️ 추첨 일정 및 방송</h2>
        <ul>
          <li>매주 토요일 오후 8시 35분</li>
          <li>MBC 방송국 스튜디오에서 생방송 진행</li>
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>🎲 추첨 방식</h2>
        <p>공인된 추첨기계로 1~45 중 무작위 번호 6개 + 보너스 번호 1개를 추출합니다.<br />
        공정성과 투명성을 위해 생방송 및 공개검증이 진행됩니다.</p>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>📺 당첨 결과 확인 방법</h2>
        <ul>
          <li>MBC 생방송</li>
          <li>판매점 또는 동행복권 홈페이지 마이페이지</li>
        </ul>
      </section>

      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 참고:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=lotMethod" target="_blank" rel="noopener noreferrer">
            추첨안내 바로가기
          </a>
        </p>
      </footer>
    </div>
  );
}
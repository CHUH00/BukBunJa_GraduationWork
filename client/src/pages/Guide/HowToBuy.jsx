import Placeholder from "../../components/Placeholder/Placeholder";

// client/src/pages/Guide/HowToBuy.jsx
export default function HowToBuy() {
  return (
    <div style={{ padding: "20px", background: "#ffffffff", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)"}}>
      <h1>구매 방법</h1>

      <section style={{ marginTop: "20px" }}>
        <h2>💡 구매 절차 요약</h2>
        <ol>
          <li>복권 종류 선택: 로또 6/45</li>
          <li>번호 선택 방식: 자동 / 반자동 / 수동</li>
          <li>구매 수량 선택: 1게임~5게임까지 선택 가능</li>
          <li>결제 및 발행</li>
        </ol>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>🏪 오프라인 구매</h2>
        <ul>
          <li>복권용지에 직접 번호 선택</li>
          <li>단말기로 발행 후 영수증 형태로 수령</li>
          <li>판매점 직원 요청 시 자동 발행 가능</li>
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
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

      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 더 알아보기:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=buyInfo" target="_blank" rel="noopener noreferrer">
            구매방법 안내 페이지
          </a>
        </p>
      </footer>
    </div>
  );
}
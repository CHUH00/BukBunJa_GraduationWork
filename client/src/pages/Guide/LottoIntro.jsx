import Placeholder from "../../components/Placeholder/Placeholder";

// client/src/pages/Guide/LottoIntro.jsx
export default function LottoIntro() {
  return (
    <div style={{ padding: "20px", background: "#ffffffff", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
      <h1>로또 6/45 소개</h1>

      <section style={{ marginTop: "20px" }}>
        <h2>🎯 로또 6/45란?</h2>
        <p>45개의 숫자 중 6개를 선택해 당첨을 노리는 대표적인 온라인 복권입니다.<br />
        전국의 편의점, 복권방, 가판대, 동행복권 홈페이지에서 구매할 수 있습니다.</p>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>💻 온라인 복권이란?</h2>
        <p>중앙전산시스템과 연결된 단말기를 통해 실시간으로 발행·판매되는 복권입니다.<br />
        인터넷복권과는 다른 개념으로, 오프라인 구매도 포함됩니다.</p>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>🔢 번호 선택 방식</h2>
        <ul>
          <li>자동: 6개 번호 무작위 자동 선택</li>
          <li>반자동: 일부 번호 직접 선택, 나머지는 자동</li>
          <li>수동: 6개 번호 모두 직접 선택</li>
        </ul>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>💰 당첨금 구성</h2>
        <p>판매량에 따라 1등 당첨금이 달라집니다.<br />
        1등 당첨자가 없으면 최대 2회까지 당첨금이 이월됩니다.</p>
      </section>

      <footer style={{ marginTop: "30px", padding: "10px", borderTop: "1px solid #ddd" }}>
        <p>
          👉 더 알아보기:{" "}
          <a href="https://dhlottery.co.kr/gameInfo.do?method=gameMethod" target="_blank" rel="noopener noreferrer">
            로또 6/45 소개 페이지 바로가기
          </a>
        </p>
      </footer>
    </div>
  );
}
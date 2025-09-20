import { useState } from "react";

const containerStyle = {
    maxWidth: "1350px",
    maxHeight: "800px",
    backgroundColor: "#fff",
    margin: "-835px 0 0 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: 20,
    borderRadius: 12,
    flex: 1,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const cardStyle = {
    backgroundColor: "#fdecee",
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
    padding: 30,
    display: "flex",
    flexDirection: "column",
    minHeight: 290,
};

const titleStyle = {
    fontWeight: "bold",
    fontSize: 26,
    color: "#7a0e0e",
    marginTop: 13,
    textAlign: "center",
};

const contentStyle = {
    fontSize: 15,
    marginTop: 13
};

const PAGE = {
    backgroundColor: "#fdecee",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    padding: 20,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
};

const INNER = {
    height: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column"
};

const HEADER = {
    fontSize: "40px",
    fontWeight: 800,
    marginTop: 0,
    marginBottom: 10,
    marginLeft: 40
  };


export default function LottoIntro() {
    const [index, setIndex] = useState(0);

    const cards = [
        {
            title: "🎯 로또 6/45란?",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>1~45 사이의 숫자 중 6개를 선택하여 맞추는 복권입니다.</li>
                    <li>매주 토요일 오후 8시에 추첨이 진행됩니다.</li>
                    <li>1등부터 5등까지 당첨 등위가 있습니다.</li>
                </ul>
            ),
        },
        {
            title: "💻 온라인 복권이란?",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>동행복권 공식 홈페이지에서 회원가입 후 구매할 수 있는 인터넷 복권입니다.</li>
                    <li>실물 종이 없이, 온라인상에서 구매 및 당첨 확인이 가능합니다.</li>
                </ul>
            ),
        },
        {
            title: "🔢 번호 선택 방식",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>직접 선택: 1~45 중 6개 번호를 직접 고릅니다.</li>
                    <li>자동 선택: 컴퓨터가 무작위로 6개 번호를 골라줍니다.</li>
                    <li>반자동: 일부 번호는 직접, 나머지는 자동으로 선택합니다.</li>
                </ul>
            ),
        },
        {
            title: "💰 당첨금 구성",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>1등: 6개 번호 모두 맞춤</li>
                    <li>2등: 5개 번호 + 보너스 번호 맞춤</li>
                    <li>3등: 5개 번호 맞춤</li>
                    <li>4등: 4개 번호 맞춤</li>
                    <li>5등: 3개 번호 맞춤</li>
                </ul>
            ),
        },
        {
            title: "📍 어디서 살 수 있나요?",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>오프라인: 전국 편의점, 복권방, 가판대 등</li>
                    <li>
                        온라인:{" "}
                        <a href="https://dhlottery.co.kr" target="_blank" rel="noopener noreferrer" style={{ color: "#7a0e0e", textDecoration: "underline" }}>
                            동행복권 공식 홈페이지
                        </a>
                    </li>
                </ul>
            ),
        },
        {
            title: "🕒 판매 시간",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>매일 06:00 ~ 24:00 (연중무휴)</li>
                    <li>토요일(추첨일)에는 20:00까지 구매 가능</li>
                    <li>추첨일 20시 이후 ~ 일요일 06시까지는 판매 중단</li>
                </ul>
            ),
        },
        {
            title: "🔑 온라인 구매 조건",
            content: (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>만 19세 이상 성인만 구매 가능</li>
                    <li>동행복권 홈페이지 회원가입 필수</li>
                    <li>본인 명의 계좌 및 휴대폰 인증 필요</li>
                </ul>
            ),
        },
        {
            title: "💡 구매 절차 요약",
            content: (
                <ol style={{ paddingLeft: 20, marginTop: 8 }}>
                    <li>구매처 방문 또는 동행복권 홈페이지 접속</li>
                    <li>회원가입/로그인(온라인의 경우)</li>
                    <li>번호 선택(직접, 자동, 반자동 중 선택)</li>
                    <li>구매 수량 및 결제</li>
                    <li>복권 확인 및 추첨 기다리기</li>
                </ol>
            ),
        },
    ];

    const CARD_COUNT = 4;
    const total = cards.length;
    const getWrappedIndex = (i) => (i + total) % total;
    const visibleCards = Array.from({ length: CARD_COUNT }).map((_, idx) => cards[getWrappedIndex(index + idx)]);
    const handlePrev = () => setIndex(i => getWrappedIndex(i - 1));
    const handleNext = () => setIndex(i => getWrappedIndex(i + 1));

    return (
        <div style={PAGE}>
            <div style={INNER}>
                <h1 style={HEADER}>로또 가이드</h1>
                <p style={{ margin:"-8px 0px 0px 40px", color:"#7f1d1d", fontSize:13 }}>
                  로또 6/45와 온라인 복권에 대한 기본적인 정보와 유용한 링크를 제공합니다.
                </p>
            </div>
            <div style={containerStyle}>
                {/* 슬라이더 */}
                <div style={{ display: "flex", alignItems: "center", marginTop: 30 }}>
                    <span onClick={handlePrev} style={{ cursor: "pointer", marginRight: 15, fontSize: 30, color: "#7a0e0e", display: "flex", alignItems: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
                            <polyline points="13,4 7,10 13,16" stroke="#7a0e0e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                        <div style={{ display: "flex", gap: 32, transition: "transform 0.4s cubic-bezier(.4,.8,.3,1)" }}>
                            {visibleCards.map((card, idx) => (
                                <div key={idx} style={{ flex: `0 0 ${100 / CARD_COUNT}%`, minWidth: 0, boxSizing: "border-box" }}>
                                    <div style={cardStyle}>
                                        <div style={titleStyle}>
                                            {card.title}
                                        </div>
                                        <div style={contentStyle}>{card.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* 오른쪽 그라데이션*/}
                        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "15%", pointerEvents: "none", background: "linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)" }} />
                    </div>
                    <span onClick={handleNext} style={{ cursor: "pointer", marginLeft: 15, fontSize: 30, color: "#7a0e0e", display: "flex", alignItems: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
                            <polyline points="7,4 13,10 7,16" stroke="#7a0e0e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>

                {/* 인디케이터 */}
                <div style={{ textAlign: "center", width: "100%", marginTop: 10, marginBottom: 10 }}>
                    {cards.map((_, i) => (
                        <span key={i} style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", margin: "-3px 4px", background: i === index ? "#7a0e0e" : "#ccc" }} />
                    ))}
                </div>

                {/* 유용한 로또 링크 카드 */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                    <div style={{
                        ...cardStyle,
                        maxHeight: 400,
                        maxWidth: 1235,
                        width: "100%",
                        margin: "0 auto"
                    }}>
                        <div style={titleStyle}>
                            🔗 유용한 로또 링크
                        </div>
                        <div style={contentStyle}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <tbody>
                                    <tr style={{ borderBottom: "1px solid #f3d7d7" }}>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top", width: "70%" }}>
                                            로또 6/45 공식 홈페이지에 가고 싶다면?
                                        </td>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top", textAlign: "right" }}>
                                            <a href="https://dhlottery.co.kr/common.do?method=main" target="_blank" rel="noopener noreferrer" style={{ color: "#7a0e0e", textDecoration: "underline", fontWeight: "bold" }}>
                                                바로가기
                                            </a>
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: "1px solid #f3d7d7" }}>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top" }}>
                                            로또 구매 방법에 대해서 정확히 알고 싶다면?
                                        </td>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top", textAlign: "right" }}>
                                            <a href="https://dhlottery.co.kr/gameInfo.do?method=buyLotto" target="_blank" rel="noopener noreferrer" style={{ color: "#7a0e0e", textDecoration: "underline", fontWeight: "bold" }}>
                                                바로가기
                                            </a>
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: "1px solid #f3d7d7" }}>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top" }}>
                                            로또 누적 히스토리가 궁금하다면?
                                        </td>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top", textAlign: "right" }}>
                                            <a href="https://dhlottery.co.kr/gameInfo.do?method=statHistory" target="_blank" rel="noopener noreferrer" style={{ color: "#7a0e0e", textDecoration: "underline", fontWeight: "bold" }}>
                                                바로가기
                                            </a>
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: "1px solid #f3d7d7" }}>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top" }}>
                                            추첨방송을 다시 보고 싶다면?
                                        </td>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top", textAlign: "right" }}>
                                            <a href="https://dhlottery.co.kr/gameResult.do?method=lotTv" target="_blank" rel="noopener noreferrer" style={{ color: "#7a0e0e", textDecoration: "underline", fontWeight: "bold" }}>
                                                바로가기
                                            </a>
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: "1px solid #f3d7d7" }}>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top" }}>
                                            당첨자 인터뷰를 보고 싶다면? 
                                        </td>
                                        <td style={{ padding: "12px 10px", verticalAlign: "top", textAlign: "right" }}>
                                            <a href="https://dhlottery.co.kr/gameResult.do?method=highWin" target="_blank" rel="noopener noreferrer" style={{ color: "#7a0e0e", textDecoration: "underline", fontWeight: "bold" }}>
                                                바로가기
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
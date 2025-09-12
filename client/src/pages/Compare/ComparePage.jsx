import { useEffect, useState } from "react";
import { getHistory } from "../../utils/api";
import LottoBall from "../../components/LottoBall";

export default function ComparePage() {
    const [list, setList] = useState([]);
    const [err, setErr] = useState("");
    // 입력값
    const [drawA, setDrawA] = useState("");
    const [drawB, setDrawB] = useState("");
    // 확인된 회차 데이터
    const [confirmedDrawA, setConfirmedDrawA] = useState(null);
    const [confirmedDrawB, setConfirmedDrawB] = useState(null);

    useEffect(() => {
        getHistory(2000)
            .then(data => {
                setList(data);
                // 최신 2개 회차 자동 선택
                if (data && data.length >= 2) {
                    setDrawA(String(data[0].draw_number));
                    setDrawB(String(data[1].draw_number));
                    setConfirmedDrawA(data[0]);
                    setConfirmedDrawB(data[1]);
                }
            })
            .catch(e => setErr(e.message));
    }, []);

    if (err) return <div>에러: {err}</div>;
    if (!list.length) return <div>로딩중...</div>;

    // 확인 버튼 클릭 시 선택된 회차 데이터로 설정
    const handleConfirm = () => {
        if (!drawA || !drawB) {
            alert("두 회차를 모두 입력해주세요.");
            return;
        }
        const numA = parseInt(drawA, 10);
        const numB = parseInt(drawB, 10);
        if (isNaN(numA) || isNaN(numB)) {
            alert("올바른 회차 번호를 입력해주세요.");
            return;
        }
        const foundA = list.find(r => Number(r.draw_number) === numA);
        const foundB = list.find(r => Number(r.draw_number) === numB);
        if (!foundA || !foundB) {
            alert("입력하신 회차가 존재하지 않습니다.");
            return;
        }
        setConfirmedDrawA(foundA);
        setConfirmedDrawB(foundB);
    };

    // 초기화 버튼
    const handleReset = () => {
        if (list.length >= 2) {
            setDrawA(String(list[0].draw_number));
            setDrawB(String(list[1].draw_number));
            setConfirmedDrawA(list[0]);
            setConfirmedDrawB(list[1]);
        }
    };

    // 엔터키 입력시 확인
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleConfirm();
    };

    // 회차 단일 정보 렌더 함수
    function DrawInfo({ data, title }) {
        if (!data) return null;
        return (
            <div
                style={{
                    background: "#f9f9f9",
                    padding: 20,
                    borderRadius: 12,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    marginBottom: 20,
                    flex: 1,
                    minWidth: 340,
                    marginRight: 10,
                }}
            >
                <h2 style={{ marginBottom: 40, textAlign: "center" }}>
                    <span style={{ color: "#7a0e0e", fontSize: 26 }}>{data.draw_number}회차 </span>
                    <span style={{ fontSize: 24 }}>{title}</span><br />
                    <span style={{ fontSize: 14, color: "#666" }}>
                        ({data.draw_date} 추첨)
                    </span>
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 35, justifyContent: "center" }}>
                    {data.numbers.map((n, i) => (
                        <LottoBall key={i} number={n} />
                    ))}
                    <span style={{ margin: "0 6px", fontSize: 24 }}>+</span>
                    <LottoBall number={data.bonus_number} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>회차별 분석 결과 비교</h1>
            <div style={{ marginBottom: 20, display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 500 }}>회차 A</span>
                    <input
                        type="number"
                        min={1}
                        value={drawA}
                        onChange={e => setDrawA(e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={handleKeyDown}
                        placeholder="회차 입력"
                        style={{
                            padding: "6px 10px",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            width: 90
                        }}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 500 }}>회차 B</span>
                    <input
                        type="number"
                        min={1}
                        value={drawB}
                        onChange={e => setDrawB(e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={handleKeyDown}
                        placeholder="회차 입력"
                        style={{
                            padding: "6px 10px",
                            border: "1px solid #ccc",
                            borderRadius: 6,
                            width: 90
                        }}
                    />
                </div>
                <button
                    onClick={handleConfirm}
                    style={{
                        padding: "6px 14px",
                        border: "none",
                        borderRadius: 6,
                        background: "#7a0e0e",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    확인
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        padding: "6px 14px",
                        border: "none",
                        borderRadius: 6,
                        background: "#7a0e0e",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    초기화
                </button>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                {confirmedDrawA && (
                    <DrawInfo data={confirmedDrawA} title="로또 6/45 당첨 결과" />
                )}
                {confirmedDrawB && (
                    <DrawInfo data={confirmedDrawB} title="로또 6/45 당첨 결과" />
                )}
            </div>

            {/* 8가지 비교 분석 결과 카드형 */}
            {confirmedDrawA && confirmedDrawB && (
                <div
                    style={{
                        background: "#f9f9f9",
                        borderRadius: 14,
                        padding: 30,
                        marginTop: 35,
                        marginBottom: 35,
                        width: "95%",
                        minHeight: "70vh",
                        marginLeft: "auto",
                        marginRight: "auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                    }}
                >
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, textAlign: "center" }}>
                        8가지 비교 분석 결과 <br />
                        <span style={{ fontSize: 16, color: "#7a0e0e", fontWeight: "bold" }}>
                            {confirmedDrawA.draw_number}회차 vs {confirmedDrawB.draw_number}회차
                        </span>
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gridAutoRows: "auto",
                            gap: 24,
                            width: "100%",
                            minHeight: "70vh",
                        }}
                    >
                        {/* 순서: 일치한 번호, 연속 번호, 홀짝, 번호 합, 색상, 자주 등장한 번호, 잘 등장하지 않은 번호, 보너스 Top10 */}
                        <CompareMatchedNumbersCard
                            title="일치한 번호"
                            numbersA={confirmedDrawA.numbers}
                            numbersB={confirmedDrawB.numbers}
                        />
                        <CompareConsecutiveCard
                            title="연속 번호 비교"
                            desc="각 회차에서 등장한 연속된 번호 구간을 비교합니다"
                            leftTitle={`${confirmedDrawA.draw_number}회차`}
                            rightTitle={`${confirmedDrawB.draw_number}회차`}
                            leftNumbers={confirmedDrawA.numbers}
                            rightNumbers={confirmedDrawB.numbers}
                        />
                        <CompareOddEvenCard
                            title="홀짝 구성 비교"
                            leftTitle={`${confirmedDrawA.draw_number}회차`}
                            rightTitle={`${confirmedDrawB.draw_number}회차`}
                            leftNumbers={confirmedDrawA.numbers}
                            rightNumbers={confirmedDrawB.numbers}
                        />
                        <CompareSumCard
                            title="번호 합 비교"
                            drawALabel={`${confirmedDrawA.draw_number}회차`}
                            drawAValue={confirmedDrawA.numbers.reduce((a, b) => a + b, 0)}
                            drawBLabel={`${confirmedDrawB.draw_number}회차`}
                            drawBValue={confirmedDrawB.numbers.reduce((a, b) => a + b, 0)}
                        />
                        <CompareColorFrequencyCard
                            title="색상별 출현 빈도"
                            drawA={confirmedDrawA}
                            drawB={confirmedDrawB}
                        />
                        <CompareCard
                            title="자주 등장한 번호"
                            desc="자주 등장하는 상위 10개 번호의 포함을 표시합니다"
                            leftTitle={`${confirmedDrawA.draw_number}회차`}
                            rightTitle={`${confirmedDrawB.draw_number}회차`}
                            renderLeft={() => {
                                const freq = {};
                                list.forEach(r => {
                                    r.numbers.forEach(n => {
                                        freq[n] = (freq[n] || 0) + 1;
                                    });
                                });
                                const top10 = Object.entries(freq)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 10)
                                    .map(([k]) => Number(k));
                                const a = confirmedDrawA.numbers.filter(n => top10.includes(n));
                                return a.length
                                    ? a.sort((x, y) => x - y).map((n, i) => (
                                        <LottoBall key={i} number={n} />
                                    ))
                                    : <span>없음</span>;
                            }}
                            renderRight={() => {
                                const freq = {};
                                list.forEach(r => {
                                    r.numbers.forEach(n => {
                                        freq[n] = (freq[n] || 0) + 1;
                                    });
                                });
                                const top10 = Object.entries(freq)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 10)
                                    .map(([k]) => Number(k));
                                const b = confirmedDrawB.numbers.filter(n => top10.includes(n));
                                return b.length
                                    ? b.sort((x, y) => x - y).map((n, i) => (
                                        <LottoBall key={i} number={n} />
                                    ))
                                    : <span>없음</span>;
                            }}
                        />
                        <CompareCard
                            title="잘 등장하지 않은 번호"
                            desc="잘 등장하지 않는 하위 10개 번호의 포함을 표시합니다"
                            leftTitle={`${confirmedDrawA.draw_number}회차`}
                            rightTitle={`${confirmedDrawB.draw_number}회차`}
                            renderLeft={() => {
                                const freq = {};
                                list.forEach(r => {
                                    r.numbers.forEach(n => {
                                        freq[n] = (freq[n] || 0) + 1;
                                    });
                                });
                                for (let i = 1; i <= 45; i++) if (!freq[i]) freq[i] = 0;
                                const bottom10 = Object.entries(freq)
                                    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
                                    .slice(0, 10)
                                    .map(([k]) => Number(k));
                                const a = confirmedDrawA.numbers.filter(n => bottom10.includes(n));
                                return a.length
                                    ? a.sort((x, y) => x - y).map((n, i) => (
                                        <LottoBall key={i} number={n} />
                                    ))
                                    : <span>없음</span>;
                            }}
                            renderRight={() => {
                                const freq = {};
                                list.forEach(r => {
                                    r.numbers.forEach(n => {
                                        freq[n] = (freq[n] || 0) + 1;
                                    });
                                });
                                for (let i = 1; i <= 45; i++) if (!freq[i]) freq[i] = 0;
                                const bottom10 = Object.entries(freq)
                                    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
                                    .slice(0, 10)
                                    .map(([k]) => Number(k));
                                const b = confirmedDrawB.numbers.filter(n => bottom10.includes(n));
                                return b.length
                                    ? b.sort((x, y) => x - y).map((n, i) => (
                                        <LottoBall key={i} number={n} />
                                    ))
                                    : <span>없음</span>;
                            }}
                        />
                        <CompareBonusTopCard
                            title="자주 등장한 보너스 번호 포함"
                            desc="각 회차의 보너스 번호가 상위 10개 보너스 번호에 포함되는지 표시합니다"
                            drawA={confirmedDrawA}
                            drawB={confirmedDrawB}
                            list={list}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
// 비교 카드 컴포넌트
function CompareCard({ title, desc, leftTitle, rightTitle, renderLeft, renderRight }) {
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            {desc && (
                <div style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 8,
                    textAlign: "center"
                }}>
                    {desc}
                </div>
            )}
            <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                marginTop: 0
            }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRight: "1px solid #eee",
                    paddingRight: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{leftTitle}</div>
                    <div style={{ minHeight: 28 }}>{renderLeft()}</div>
                </div>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingLeft: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{rightTitle}</div>
                    <div style={{ minHeight: 28 }}>{renderRight()}</div>
                </div>
            </div>
        </div>
    );
}
// 일치한 번호 카드(하나의 결과 영역, LottoBall 스타일 적용)
function CompareMatchedNumbersCard({ title, numbersA, numbersB }) {
    const matched = numbersA.filter(n => numbersB.includes(n)).sort((a, b) => a - b);
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            <div style={{
                fontSize: 13,
                color: "#666",
                marginBottom: 8,
                textAlign: "center"
            }}>
                두 회차 당첨 번호 사이에서 일치한 번호입니다
            </div>
            <div style={{
                fontSize: matched.length ? 28 : 20,
                fontWeight: matched.length ? 700 : 400,
                color: matched.length ? "#222" : "#aaa",
                textAlign: "center",
                minHeight: 40,
                letterSpacing: 2,
                display: "flex",
                gap: 14,
                justifyContent: "center"
            }}>
                {matched.length
                    ? matched.map((n, i) => (
                        <LottoBall key={n} number={n} />
                    ))
                    : <span>없음</span>
                }
            </div>
        </div>
    );
}

// 홀짝 구성 비교 카드
function CompareOddEvenCard({ title, leftTitle, rightTitle, leftNumbers, rightNumbers }) {
    const calcOddEven = arr => {
        const odd = arr.filter(n => n % 2 === 1).length;
        const even = arr.length - odd;
        return { odd, even };
    };
    const left = calcOddEven(leftNumbers);
    const right = calcOddEven(rightNumbers);
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            <div style={{
                fontSize: 13,
                color: "#666",
                marginBottom: 8,
                textAlign: "center"
            }}>
                각 회차의 홀수/짝수 개수를 비교합니다
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginTop: 0
            }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRight: "1px solid #eee",
                    paddingRight: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{leftTitle}</div>
                    <div style={{
                        minHeight: 28,
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        letterSpacing: 2
                    }}>
                        {left.odd}:{left.even}
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingLeft: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{rightTitle}</div>
                    <div style={{
                        minHeight: 28,
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        letterSpacing: 2
                    }}>
                        {right.odd}:{right.even}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 번호 합 비교 카드
function CompareSumCard({ title, drawALabel, drawAValue, drawBLabel, drawBValue }) {
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            <div style={{
                fontSize: 13,
                color: "#666",
                marginBottom: 8,
                textAlign: "center"
            }}>
                각 회차의 번호 합을 비교합니다
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginTop: 0
            }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRight: "1px solid #eee",
                    paddingRight: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{drawALabel}</div>
                    <div style={{
                        minHeight: 28,
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        letterSpacing: 2
                    }}>{drawAValue}</div>
                </div>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingLeft: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{drawBLabel}</div>
                    <div style={{
                        minHeight: 20,
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        letterSpacing: 2
                    }}>{drawBValue}</div>
                </div>
            </div>
        </div>
    );
}
// 색상별 출현 빈도 비교 카드 (3행 레이아웃)
function CompareColorFrequencyCard({ title, drawA, drawB }) {
    // 색상 매핑 함수
    const colorMap = n => {
        if (n <= 10) return "노랑";
        if (n <= 20) return "파랑";
        if (n <= 30) return "빨강";
        if (n <= 40) return "회색";
        return "초록";
    };
    // 색상별 개수 카운트 함수
    const countColors = arr => {
        const obj = {};
        arr.forEach(n => {
            const c = colorMap(n);
            obj[c] = (obj[c] || 0) + 1;
        });
        return obj;
    };
    const colorTypes = ["노랑", "파랑", "빨강", "회색", "초록"];
    const colorBallColors = {
        "노랑": "#fbc400",
        "파랑": "#69c8f2",
        "빨강": "#ff7272",
        "회색": "#aaaaaa",
        "초록": "#b0d840"
    };
    const aColors = countColors(drawA.numbers);
    const bColors = countColors(drawB.numbers);
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
                justifyContent: "flex-start"
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            <div style={{
                fontSize: 13,
                color: "#666",
                marginBottom: 8,
                textAlign: "center"
            }}>
                각 회차의 색상별 당첨 번호 개수를 보여줍니다
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 2 }}>
                {/* 색상 공 5개 */}
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 16,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {colorTypes.map(c => (
                        <div
                            key={c}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: colorBallColors[c],
                                border: "1.5px solid #ddd",
                                margin: 0
                            }}
                        />
                    ))}
                </div>
                {/* A회차: 회차명 한 줄, 다음 줄에 색상별 개수 */}
                <div style={{ marginTop: 4 }}>
                    <div style={{
                        fontSize: 13,
                        color: "#888",
                        fontWeight: 500,
                        textAlign: "center",
                        marginBottom: 2
                    }}>
                        {drawA.draw_number}회차
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 20,
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        {colorTypes.map(c => (
                            <div
                                key={c}
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: "#333",
                                    textAlign: "center",
                                    width: 28
                                }}
                            >
                                {aColors[c] || 0}
                            </div>
                        ))}
                    </div>
                </div>
                {/* B회차: 회차명 한 줄, 다음 줄에 색상별 개수 */}
                <div style={{ marginTop: 4 }}>
                    <div style={{
                        fontSize: 13,
                        color: "#888",
                        fontWeight: 500,
                        textAlign: "center",
                        marginBottom: 2
                    }}>
                        {drawB.draw_number}회차
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 16,
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        {colorTypes.map(c => (
                            <div
                                key={c}
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: "#333",
                                    textAlign: "center",
                                    width: 28
                                }}
                            >
                                {bColors[c] || 0}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
// 연속 번호 구간을 비교하는 카드
function CompareConsecutiveCard({ title, desc, leftTitle, rightTitle, leftNumbers, rightNumbers }) {
    // 주어진 numbers 배열에서 연속된 구간들을 추출
    function findConsecutiveGroups(numbers) {
        if (!numbers || !numbers.length) return [];
        const sorted = [...numbers].sort((a, b) => a - b);
        const groups = [];
        let group = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                group.push(sorted[i]);
            } else {
                if (group.length > 1) groups.push([...group]);
                group = [sorted[i]];
            }
        }
        if (group.length > 1) groups.push([...group]);
        return groups;
    }
    const leftGroups = findConsecutiveGroups(leftNumbers);
    const rightGroups = findConsecutiveGroups(rightNumbers);
    // 렌더 함수
    const renderGroups = (groups) => {
        if (!groups.length) return <span>없음</span>;
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {groups.map((g, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 4 }}>
                        {g.map((n, i) => (
                            <LottoBall key={i} number={n} />
                        ))}
                    </div>
                ))}
            </div>
        );
    };
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            {desc && (
                <div style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 8,
                    textAlign: "center"
                }}>
                    {desc}
                </div>
            )}
            <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                marginTop: 0
            }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRight: "1px solid #eee",
                    paddingRight: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{leftTitle}</div>
                    <div style={{ minHeight: 28 }}>{renderGroups(leftGroups)}</div>
                </div>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingLeft: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{rightTitle}</div>
                    <div style={{ minHeight: 28 }}>{renderGroups(rightGroups)}</div>
                </div>
            </div>
        </div>
    );
}

// 보너스 번호 Top10 포함 여부 카드
function CompareBonusTopCard({ title, desc, drawA, drawB, list }) {
    // 보너스 번호 빈도 계산
    const freq = {};
    list.forEach(r => {
        const n = r.bonus_number;
        freq[n] = (freq[n] || 0) + 1;
    });
    const top10 = Object.entries(freq)
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .slice(0, 10)
        .map(([k]) => Number(k));
    // 보너스 번호가 없을 수도 있음
    const renderStatus = (bonusNumber) => {
        if (!bonusNumber || isNaN(bonusNumber)) return <span>없음</span>;
        return top10.includes(bonusNumber)
            ? <span style={{ fontWeight: 600, color: "#1a7a1a" }}>Top10 포함</span>
            : <span style={{ fontWeight: 600}}>없음</span>;
    };
    return (
        <div
            style={{
                background: "#f9f9f9",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                minHeight: 130,
            }}
        >
            <div style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#7a0e0e",
                marginBottom: 7,
                textAlign: "center"
            }}>
                {title}
            </div>
            {desc && (
                <div style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 8,
                    textAlign: "center"
                }}>
                    {desc}
                </div>
            )}
            <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                marginTop: 0
            }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRight: "1px solid #eee",
                    paddingRight: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{`${drawA.draw_number}회차`}</div>
                    <div style={{ minHeight: 28 }}>
                        {renderStatus(drawA.bonus_number)}
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingLeft: 8,
                    minHeight: 60
                }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 7, fontWeight: 500 }}>{`${drawB.draw_number}회차`}</div>
                    <div style={{ minHeight: 28 }}>
                        {renderStatus(drawB.bonus_number)}
                    </div>
                </div>
            </div>
        </div>
    );
}
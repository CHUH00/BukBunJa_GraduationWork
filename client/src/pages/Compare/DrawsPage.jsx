import { useEffect, useState } from "react";
import { getHistory } from "../../utils/api";
import LottoBall from "../../components/LottoBall";

export default function DrawsPage() {
    const [list, setList] = useState([]);
    const [selected, setSelected] = useState(null);
    const [err, setErr] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        getHistory(2000)
            .then(data => {
                console.log("전체 회차 데이터:", data);
                setList(data);
                setSelected(data[0]); // 최신 회차 기본 선택
            })
            .catch(e => setErr(e.message));
    }, []);

    if (err) return <div>에러: {err}</div>;
    if (!list.length) return <div>로딩중...</div>;

    const handleSearch = () => {
        if (!search) return alert("올바른 회차를 입력해주세요.");
        const searchNum = parseInt(search, 10);
        const found = list.find(r => Number(r.draw_number) === searchNum);
        if (found) {
            setSelected(found);
        } else {
            alert("해당 회차를 찾을 수 없습니다.");
        }
    };

    const handleReset = () => {
        setSearch("");
        setSelected(list[0]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>회차별 당첨번호 조회</h1>

            <div style={{ marginBottom: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyPress={handleKeyPress}
                    placeholder="회차 입력"
                    style={{
                        padding: "6px 10px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        flex: "0 0 150px"
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        padding: "6px 14px",
                        border: "none",
                        borderRadius: 6,
                        background: "#7a0e0e",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    검색
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

            {selected && (
                <div
                    style={{
                        background: "#fff",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        marginBottom: 20
                    }}
                >
                    <h2 style={{ marginBottom: 50, textAlign: "center" }}>
                        <span style={{ color: "#7a0e0e", fontSize: 30 }}>{selected.draw_number}회차 </span> 
                        <span style={{ fontSize: 30 }}>로또 6/45 당첨 결과</span><br></br>
                        <span style={{fontSize: 16, color: "#666" }}>
                            ({selected.draw_date} 추첨)
                        </span>
                    </h2>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 50, justifyContent: "center" }}>                        
                        {selected.numbers.map((n, i) => (
                            <LottoBall key={i} number={n} />
                        ))}
                        <span style={{ margin: "0 6px", fontSize: 30 }}>+</span>
                        <LottoBall number={selected.bonus_number} />
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>순위</th>
                                <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>당첨자 수</th>
                                <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>총 당첨금액</th>
                                <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>1게임당 당첨금액</th>
                                <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>당첨기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1,2,3,4,5].map(rank => {
                                let winnersKey = "";
                                let amountKey = "";
                                let criteria = "";
                                switch(rank) {
                                    case 1:
                                        winnersKey = "first_prize_winners";
                                        amountKey = "first_prize_amount";
                                        criteria = "당첨번호 6개 숫자일치";
                                        break;
                                    case 2:
                                        winnersKey = "second_prize_winners";
                                        amountKey = "second_prize_amount";
                                        criteria = "당첨번호 5개 숫자일치 + 보너스 숫자일치";
                                        break;
                                    case 3:
                                        winnersKey = "third_prize_winners";
                                        amountKey = "third_prize_amount";
                                        criteria = "당첨번호 5개 숫자일치";
                                        break;
                                    case 4:
                                        winnersKey = "fourth_prize_winners";
                                        amountKey = "fourth_prize_amount";
                                        criteria = "당첨번호 4개 숫자일치";
                                        break;
                                    case 5:
                                        winnersKey = "fifth_prize_winners";
                                        amountKey = "fifth_prize_amount";
                                        criteria = "당첨번호 3개 숫자일치";
                                        break;
                                }
                                const winners = Number(selected[winnersKey]);
                                const amount = Number(selected[amountKey]);
                                const totalAmount = winners && amount ? winners * amount : 0;
                                return (
                                    <tr key={rank}>
                                        <td style={{ padding: 8, textAlign: "center" }}>{rank}등</td>
                                        <td style={{ padding: 8, textAlign: "center" }}>
                                            {winners ? winners.toLocaleString() : "-"}
                                        </td>
                                        <td style={{ padding: 8, textAlign: "center" }}>
                                            {totalAmount ? totalAmount.toLocaleString() + "원" : "-"}
                                        </td>
                                        <td style={{ padding: 8, textAlign: "center" }}>
                                            {amount ? amount.toLocaleString() + "원" : "-"}
                                        </td>
                                        <td style={{ padding: 8, textAlign: "center" }}>
                                            {criteria}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ marginTop: 30 }}>
                        <small style={{ color: "#666" }}>
                            ※ 당첨금 지급기한 : 지급개시일로부터 1년 (휴일인 경우 익일영업)
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}
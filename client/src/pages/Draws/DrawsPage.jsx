// client/src/pages/DrawsPage.jsx
import { useEffect, useState } from "react";
import { getHistory } from "../../utils/api";

export default function DrawsPage() {
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        // getHistory 함수는 아래 utils/api.js에서 수정
        getHistory(10).then(setRows).catch(e => setErr(e.message));
    }, []);

    if (err) return <div>에러: {err}</div>;
    if (!rows.length) return <div>로딩중...</div>;

    return (
        <div>
            <h1>회차별 당첨번호 조회</h1>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                <thead>
                <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>회차</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>추첨일</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>번호</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>보너스</th>
                </tr>
                </thead>
                <tbody>
                {rows.map(r => (
                    // 키를 r.draw_number로 변경
                    <tr key={r.draw_number}>
                        <td style={{ padding: 8 }}>{r.draw_number}</td>
                        <td style={{ padding: 8 }}>{r.draw_date}</td>
                        <td style={{ padding: 8 }}>{r.numbers.join(", ")}</td>
                        <td style={{ padding: 8 }}>{r.bonus_number}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
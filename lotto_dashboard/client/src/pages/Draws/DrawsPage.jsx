import { useEffect, useState } from "react";
import { getHistory } from "../../utils/api";

export default function DrawsPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
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
            <tr key={r.draw_no}>
              <td style={{ padding: 8 }}>{r.draw_no}</td>
              <td style={{ padding: 8 }}>{r.draw_date}</td>
              <td style={{ padding: 8 }}>{r.numbers.join(", ")}</td>
              <td style={{ padding: 8 }}>{r.bonus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
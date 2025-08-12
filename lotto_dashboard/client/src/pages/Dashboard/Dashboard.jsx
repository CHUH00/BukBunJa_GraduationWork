import { useEffect, useState } from "react";
import { getLatest } from "../../utils/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getLatest().then(setData).catch(e => setErr(e.message));
  }, []);

  if (err) return <div>에러: {err}</div>;
  if (!data) return <div>로딩중...</div>;

  return (
    <div>
      <h1>메인 대시보드</h1>
      <p>최신 회차: <strong>{data.draw_no}</strong>회</p>
      <p>추첨일: {data.draw_date}</p>
      <p>당첨번호: {data.numbers.join(", ")} + 보너스 {data.bonus}</p>
    </div>
  );
}
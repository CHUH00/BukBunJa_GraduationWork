import { useEffect, useState } from "react";
import { getRecommend } from "../../utils/api";

export default function RecommendPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getRecommend(5).then(setData).catch(e => setErr(e.message));
  }, []);

  if (err) return <div>에러: {err}</div>;
  if (!data) return <div>로딩중...</div>;

  return (
    <div>
      <h1>AI 기반 추천</h1>
      <ul>
        {data.results.map(s => (
          <li key={s.set_id}>세트 {s.set_id}: {s.numbers.join(", ")}</li>
        ))}
      </ul>
    </div>
  );
}
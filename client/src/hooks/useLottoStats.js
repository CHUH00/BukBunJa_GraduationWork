import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { pickArray, computeLottoStats } from "../lib/lottoStats";

// rows가 없으면 fetchUrl로 가져오고, 있으면 그대로 사용
export default function useLottoStats({ fetchUrl = "/lotto/draws", rows: externalRows }) {
  const hasRows = Array.isArray(externalRows) && externalRows.length > 0;
  const [rows, setRows]       = useState(hasRows ? externalRows : []);
  const [loading, setLoading] = useState(!hasRows);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (hasRows) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await axios.get(fetchUrl, { validateStatus: () => true });
        if (!mounted) return;
        if (res.status !== 200) { setError(`HTTP ${res.status}`); setRows([]); return; }
        const arr = pickArray(res.data);
        if (!arr) { setError("JSON 배열 아님"); setRows([]); return; }
        setRows(arr);
      } catch (e) {
        setError(e?.message || "데이터 로드 실패");
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [fetchUrl, hasRows]);

  const stats = useMemo(() => computeLottoStats(rows), [rows]);

  return { rows, stats, loading, error, setRows };
}
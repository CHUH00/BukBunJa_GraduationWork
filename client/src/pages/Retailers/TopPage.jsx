import { useEffect, useMemo, useRef, useState } from "react";
import { getTopRetailers, searchRetailers } from "../../utils/api";
import Map from "../../components/Map";
import "./Retailers.css";

export default function TopPage() {
  const [retailers, setRetailers] = useState([]);
  const [selected, setSelected] = useState(null);

  const [query, setQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState(null); 
  const initialRef = useRef([]);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(retailers.length / pageSize));

  const paged = useMemo(() => {
    const s = (page - 1) * pageSize;
    return retailers.slice(s, s + pageSize);
  }, [retailers, page]);

  useEffect(() => {
    getTopRetailers(50).then((data) => {
      setRetailers(data);
      initialRef.current = data;
      setPage(1);
      setSearchRegion(null); 
    });
  }, []);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    const result = await searchRetailers(q);
    setRetailers(result);
    setSelected(null);
    setPage(1);
    setSearchRegion(q); 
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    if (v === "") {
      setRetailers(initialRef.current);
      setSelected(null);
      setPage(1);
      setSearchRegion(null);
    }
  };

  return (
    <div className="rt-wrapper">
      <aside className="rt-panel">
        <h1 className="rt-title">당첨 판매점 조회</h1>

        <div className="rt-search">
          <input
            type="text"
            placeholder="지역명을 입력하세요 (예: 서울 · 분당 · 정자동)"
            value={query}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

        <div className="rt-list">
          {paged.map((s, idx) => (
            <div
              key={`${s.상호명}-${s.소재지}`}
              className={`rt-card ${selected?.상호명 === s.상호명 ? "rt-card--active" : ""}`}
              onClick={() => {
                if (selected?.상호명 === s.상호명) {
                  setSelected(null);
                } else {
                  setSelected(s);
                }
              }}
            >
              <div className="rt-row1">
                <span className="rt-name">
                  {(page - 1) * pageSize + idx + 1}. {s.상호명}
                </span>
                <span className="rt-count">당첨 {s.count}회</span>
              </div>
              <div className="rt-addr">{s.소재지}</div>
            </div>
          ))}
        </div>

        <div className="rt-paging">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </button>
        </div>
      </aside>

      <main className="rt-map">
        <Map
        retailers={retailers}
        selected={selected}
        searchRegion={searchRegion}
        onClearSelected={() => setSelected(null)}
        onSelect={(s) => {
            if (selected?.상호명 === s.상호명) {
            setSelected(null);
            } else {
            setSelected(s);
            }
        }}
        />
      </main>
    </div>
  );
}
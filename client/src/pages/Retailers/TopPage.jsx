import { useEffect, useState } from "react";
import { getTopRetailers, searchRetailers } from "../../utils/api";
import Map from "../../components/Map";

export default function TopPage() {
    const [retailers, setRetailers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getTopRetailers().then(setRetailers);
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;
        const result = await searchRetailers(query);
        setRetailers(result);
        setSelected(null);
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* 왼쪽 리스트 */}
            <div style={{ flex: 1, overflowY: "scroll", padding: 20, background: "#fafafa", borderRight: "1px solid #ddd" }}>
                <h2 style={{ marginBottom: 10 }}>당첨 판매점 조회</h2>

                {/* 검색창 */}
                <div style={{ display: "flex", marginBottom: 20 }}>
                    <input
                        type="text"
                        placeholder="지역명을 입력하세요 (예: 서울)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        style={{
                            flex: 1,
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px 0 0 4px"
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderLeft: "none",
                            background: "#7a0e0e",
                            color: "#fff",
                            cursor: "pointer",
                            borderRadius: "0 4px 4px 0"
                        }}
                    >
                        검색
                    </button>
                </div>

                {/* 판매점 리스트 */}
                {retailers.map((s, idx) => (
                    <div
                        key={`${s.상호명}-${s.소재지}`}
                        style={{
                            marginBottom: 12,
                            cursor: "pointer",
                            padding: "10px",
                            borderRadius: "6px",
                            background: selected?.상호명 === s.상호명 ? "#ffe1e1" : "#fff",
                            border: "1px solid #ddd",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                        onClick={() => setSelected(s)}
                    >
                        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: 4 }}>
                            {idx + 1}. {s.상호명}
                        </div>
                        <div style={{ fontSize: "13px", color: "#555" }}>{s.소재지}</div>
                        <div style={{ fontSize: "12px", marginTop: 4, color: "#7a0e0e" }}>
                            🏆 당첨 {s.count}회
                        </div>
                    </div>
                ))}
            </div>

            {/* 오른쪽 지도 */}
            <div style={{ flex: 2 }}>
                <Map retailers={retailers} selected={selected} />
            </div>
        </div>
    );
}
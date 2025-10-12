import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "./styles/_tokens.css";
import "./styles/layout.css";
import "./styles/profile.css";
import "./styles/table.css";
import "./styles/pagination.css";
import "./styles/modal.css";

import ProfileCard from "./ProfileCard";
import FavoriteNumbers from "./FavoriteNumbers";
import HistoryTable from "./HistoryTable";
import Modal from "./Modal";

function ballColor(n) {
  const num = Number(n);
  if (num >= 1 && num <= 10) return "#fbc400";
  if (num >= 11 && num <= 20) return "#69c8f2";
  if (num >= 21 && num <= 30) return "#ff7272";
  if (num >= 31 && num <= 40) return "#aaaaaa";
  return "#b0d840";
}

export default function HistoryPage() {
  // 사용자 정보
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!alive) return;
        setMe(data);
      } catch {
        setMe(null);
      } finally {
        if (alive) setLoadingMe(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 페이지네이션
  const [page, setPage] = useState(1);
  const perPage = 5;

  // 추천 이력
  const [historyItems, setHistoryItems] = useState([]);

  // ✅ 가장 최근 추천 번호 (이번 주 나의 로또 번호)
  const [latestNumbers, setLatestNumbers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/prediction/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!alive) return;

        // DB에서 받은 데이터 매핑
        const mapped = data.map((item) => ({
          prediction_id: item.prediction_id,
          draw_number: item.draw_number,
          created_at: item.created_at,
          settings: item.settings,
          recommended_numbers: item.recommended_numbers,
        }));
        setHistoryItems(mapped);

        // ✅ 최신 추천 번호 (가장 최근 생성된 것)
        if (mapped.length > 0) {
          const latest = mapped[0];
          const nums = latest.recommended_numbers?.numbers || [];
          setLatestNumbers(nums);
        } else {
          setLatestNumbers([]);
        }
      } catch (err) {
        console.error("예측 기록 불러오기 실패:", err);
        setHistoryItems([]);
        setLatestNumbers([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ 사용자들이 많이 추천받은 번호 (DB 기반)
  const [favoriteNumbers, setFavoriteNumbers] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/prediction/favorite");
        if (!alive) return;
        const sortedTop10 = data
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setFavoriteNumbers(sortedTop10);
      } catch {
        setFavoriteNumbers([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [historyItems]); // ✅ 사용자의 이력이 바뀌면 다시 불러오기

  // 페이지 계산
  const totalPages = Math.max(1, Math.ceil(historyItems.length / perPage));
  const pageItems = historyItems.slice((page - 1) * perPage, page * perPage);

  // 모달 관리
  const [detail, setDetail] = useState(null);

  const buildDetail = (it) => ({
    title: `${me?.name || "사용자"}님이 생성한 ${
      it.draw_number ?? it.prediction_id
    }회차 예상 번호`,
    numbers: it.recommended_numbers?.numbers || [],
    bonus: it.recommended_numbers?.bonus_number,
    rules: [
      { title: "출현 빈도", desc: "자주 나온 번호에 가중치 부여" },
      { title: "연/월별 트렌드", desc: "최근 회차 트렌드 반영" },
      { title: "보너스 번호 통계", desc: "상대적으로 빈도가 높은 범위 우선" },
      { title: "번호합", desc: "극단값 회피" },
      { title: "번호 페어", desc: "동반 출현 조합 고려" },
      { title: "번호 간격", desc: "연속/듬성 간격 완화" },
    ],
  });

  const openDetail = (it) => setDetail(buildDetail(it));
  const closeDetail = () => setDetail(null);

  return (
    <div className="hp-wrap">
      <div className="hp-container">
        <div className="hp-grid">
          {/* --- 마이페이지 카드 --- */}
          <section className="hp-section">
            <h3 className="hp-section-title">마이페이지</h3>
            <div className="hp-card hp-card--nochrome">
              <ProfileCard
                loading={loadingMe}
                nickname={me?.name || me?.nickname || "홍길순"}
                email={me?.email || "test@test.com"}
                avatar={me?.avatar}
                memo={
                  latestNumbers?.length
                    ? `이번 주 나의 로또 번호 : ${latestNumbers.join(", ")}`
                    : "이번 주 추천 번호가 없습니다."
                }
              />
            </div>
          </section>

          {/* --- 많이 추천받은 번호 --- */}
          <section className="hp-section">
            <h3 className="hp-section-title">사용자들이 많이 추천받은 번호</h3>
            <div className="hp-card">
              <FavoriteNumbers data={favoriteNumbers} />
            </div>
          </section>
        </div>

        {/* --- 이력 테이블 --- */}
        <section className="hp-table-card" aria-labelledby="history-heading">
          <HistoryTable items={pageItems} onDetail={openDetail} pageSize={5} />
        </section>

        {/* --- 페이지네이션 --- */}
        <nav className="hp-pagination" role="navigation" aria-label="페이지네이션">
          <button
            aria-label="이전 페이지"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            〈 이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className="hp-page-dot"
              aria-current={n === page ? "page" : undefined}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}

          <button
            aria-label="다음 페이지"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            다음 〉
          </button>
        </nav>
      </div>

      {/* --- 상세 모달 --- */}
      <Modal
        open={!!detail}
        onClose={closeDetail}
        title={detail?.title || "추천 상세"}
      >
        {detail && (
          <div>
            <div
              className="balls-track"
              style={{ marginBottom: 12, background: "#6f3131" }}
            >
              {(detail.numbers || []).map((n, i) => (
                <span key={i} className="ball" style={{ background: ballColor(n) }}>
                  {n}
                </span>
              ))}
              {detail.bonus != null && (
                <>
                  <span className="ht-plus" aria-hidden="true">
                    +
                  </span>
                  <span className="ball bonus">{detail.bonus}</span>
                </>
              )}
            </div>

            <ol className="rule-list">
              {detail.rules.map((r, i) => (
                <li key={i} className="rule-item">
                  <span className="rule-badge">{i + 1}</span>
                  <div className="rule-meta">
                    <div className="rule-title">{r.title}</div>
                    <div className="rule-desc">{r.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Modal>
    </div>
  );
}
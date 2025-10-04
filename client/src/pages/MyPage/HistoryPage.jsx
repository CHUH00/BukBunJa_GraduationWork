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
  if (num >= 1 && num <= 10) return "#F2C600";
  if (num >= 11 && num <= 20) return "#2F7FD9";
  if (num >= 21 && num <= 30) return "#D64545";
  if (num >= 31 && num <= 40) return "#8B8F98";
  return "#3AA76D";
}

export default function HistoryPage() {
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
    return () => { alive = false; };
  }, []);

  const [page, setPage] = useState(1);
  const perPage = 5;

  const favoriteNumbers = [
    { num: 17, count: 17 },
    { num: 27, count: 9 },
    { num: 34, count: 11 },
    { num: 23, count: 7 },
    { num: 33, count: 10 },
    { num: 41, count: 8 },
    { num: 5, count: 13 },
    { num: 18, count: 6 },
    { num: 1, count: 1 },
    { num: 40, count: 3 },
  ];

  const historyItems = [
    { id: 1191, round: 1191, method: "AI 로또 번호 추천", priority: 1, modelSummary: "과거 100회 상위 2조합 이상 출현 패턴 기반 확률 2.3%", button: "자세히 보기", numbers: [1, 11, 21, 31, 41, 45], bonus: 33 },
    { id: 1190, round: 1190, method: "번호빈도 통계 분석", priority: 2, modelSummary: "출현 빈도 상위 20% 번호 3개 조합 + 균형편차 보정", button: "자세히 보기", numbers: [14, 23, 25, 27, 29, 42], bonus: 16 },
    { id: 1189, round: 1189, method: "최적패턴 평가", priority: 3, modelSummary: "최근 10회 중 3회 이상 동반 번호군 2개 포함 시뮬", button: "자세히 보기", numbers: [1, 5, 12, 22, 36, 44], bonus: 21 },
    { id: 1188, round: 1188, method: "당첨번호 통계 분석", priority: 4, modelSummary: "과거 1등 당첨 패턴(짝수·홀수 비율, 고저 범위) 일치율", button: "자세히 보기", numbers: [26, 31, 39, 42, 45, 7], bonus: 7 },
    { id: 1187, round: 1187, method: "사용자 번호 맞춤 추천", priority: 5, modelSummary: "선호 패턴 기반 최적화 — 개인화 예측 신뢰도 2.9%", button: "자세히 보기", numbers: [11, 25, 30, 33, 37, 38], bonus: 2 },
    { id: 1186, round: 1186, method: "AI 로또 번호 추천", priority: 1, modelSummary: "가중치 튜닝 v2", button: "자세히 보기", numbers: [2, 9, 16, 28, 37, 40], bonus: 5 },
    { id: 1185, round: 1185, method: "번호빈도 통계 분석", priority: 2, modelSummary: "상위 20% + 편차 보정", button: "자세히 보기", numbers: [3, 8, 19, 21, 36, 43], bonus: 11 },
    { id: 1184, round: 1184, method: "최적패턴 평가", priority: 3, modelSummary: "동반 번호군 2개", button: "자세히 보기", numbers: [7, 12, 18, 24, 33, 39], bonus: 6 },
    { id: 1183, round: 1183, method: "당첨번호 통계 분석", priority: 4, modelSummary: "짝/홀 균형", button: "자세히 보기", numbers: [5, 10, 14, 27, 38, 44], bonus: 20 },
    { id: 1182, round: 1182, method: "사용자 번호 맞춤 추천", priority: 5, modelSummary: "개인화 v1", button: "자세히 보기", numbers: [6, 15, 22, 29, 34, 41], bonus: 4 },
    { id: 1181, round: 1181, method: "AI 로또 번호 추천", priority: 1, modelSummary: "패턴 기반 확률 2.1%", button: "자세히 보기", numbers: [4, 13, 17, 25, 30, 45], bonus: 9 },
    { id: 1180, round: 1180, method: "번호빈도 통계 분석", priority: 2, modelSummary: "상위 빈도 조합", button: "자세히 보기", numbers: [9, 18, 21, 32, 37, 42], bonus: 7 },
    { id: 1179, round: 1179, method: "최적패턴 평가", priority: 3, modelSummary: "최근 트렌드 반영", button: "자세히 보기", numbers: [8, 12, 23, 31, 35, 40], bonus: 14 },
  ];

  const totalPages = Math.max(1, Math.ceil(historyItems.length / perPage));
  const pageItems = historyItems.slice((page - 1) * perPage, page * perPage);

  const [detail, setDetail] = useState(null);

  const buildDetail = (it) => ({
    title: `${me?.name || "사용자"}님이 생성한 ${it.round ?? it.id}회차 예상 번호`,
    numbers: it.numbers,
    bonus: it.bonus,
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
          <section className="hp-section">
            <h3 className="hp-section-title">마이페이지</h3>
            <div className="hp-card hp-card--nochrome">
              <ProfileCard
                loading={loadingMe}
                nickname={me?.name || me?.nickname || "홍길순"}
                email={me?.email || "test@test.com"}
                avatar={me?.avatar}
                memo={"이번 주 나의 로또 번호 : 3, 19, 22, 34, 39, 42 + 24"}
              />
            </div>
          </section>

          <section className="hp-section">
            <h3 className="hp-section-title">많이 추천받은 번호</h3>
            <div className="hp-card">
              <FavoriteNumbers data={favoriteNumbers} />
            </div>
          </section>
        </div>

        <section className="hp-table-card" aria-labelledby="history-heading">
          <HistoryTable items={pageItems} onDetail={openDetail} pageSize={5} />
        </section>

        <nav className="hp-pagination" role="navigation" aria-label="페이지네이션">
          <button
            aria-label="이전 페이지"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            〈 Prev
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
            Next 〉
          </button>
        </nav>
      </div>

      <Modal open={!!detail} onClose={closeDetail} title={detail?.title || "추천 상세"}>
        {detail && (
          <div>
            <div className="balls-track" style={{ marginBottom: 12, background: "#6f3131" }}>
              {(detail.numbers || []).map((n, i) => (
                <span key={i} className="ball" style={{ background: ballColor(n) }}>{n}</span>
              ))}
              {detail.bonus != null && (
                <>
                  <span className="ht-plus" aria-hidden="true">+</span>
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
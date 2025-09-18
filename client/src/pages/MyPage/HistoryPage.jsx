import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "./styles/_tokens.css";
import "./styles/layout.css";
import "./styles/profile.css";
import "./styles/charts.css";
import "./styles/table.css";
import "./styles/pagination.css";
import "./styles/tabs.css";

import ProfileCard from "./ProfileCard";
import PatternChart from "./PatternChart";
import FavoriteNumbers from "./FavoriteNumbers";
import HistoryTable from "./HistoryTable";

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
    return () => {
      alive = false;
    };
  }, []);

  const [tab, setTab] = useState("analysis");
  const [sub, setSub] = useState("all");

  const patternData = [
    { label: "회차별 통계", value: 15 },
    { label: "번호별 통계", value: 30 },
    { label: "AI 로또 번호 추천", value: 35 },
    { label: "사용자 번호 맞춤 추천", value: 20 },
  ];
  const favoriteNumbers = [
    { num: 17, count: 12 },
    { num: 27, count: 9 },
    { num: 34, count: 11 },
    { num: 23, count: 7 },
    { num: 33, count: 10 },
    { num: 41, count: 8 },
  ];

  const historyItems = [
    { id: 1, method: "AI 로또 번호 추천", priority: 1, modelSummary: "과거 100회 상위 2조합 이상 출현 패턴 기반 확률 2.3%", button: "자세히 보기", numbers: [14, 23, 25, 27, 29, 42], bonus: 16 },
    { id: 2, method: "번호빈도 통계 분석", priority: 2, modelSummary: "출현 빈도 상위 20% 번호 3개 조합 + 균형편차 보정", button: "자세히 보기", numbers: [1, 5, 12, 22, 36, 44], bonus: 21 },
    { id: 3, method: "최적패턴 평가", priority: 3, modelSummary: "최근 10회 중 3회 이상 동반 번호군 2개 포함 시뮬", button: "자세히 보기", numbers: [26, 31, 39, 42, 45, 7], bonus: 7 },
    { id: 4, method: "당첨번호 통계 분석", priority: 4, modelSummary: "과거 1등 당첨 패턴(짝수·홀수 비율, 고저 범위) 일치율", button: "자세히 보기", numbers: [11, 25, 30, 33, 37, 38], bonus: 2 },
    { id: 5, method: "사용자 번호 맞춤 추천", priority: 5, modelSummary: "선호 패턴 기반 최적화 — 개인화 예측 신뢰도 2.9%", button: "자세히 보기", numbers: [21, 24, 25, 32, 40, 43], bonus: 31 },
  ];

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
                avatarUrl={me?.avatar_url || "https://placehold.co/120x120?text=%F0%9F%91%A4"}
                memo={"이번 주 나의 로또 번호 : 3, 19, 22, 34, 39, 42 + 24"}
              />
            </div>
          </section>
          <section className="hp-section">
            <h3 className="hp-section-title">나의 분석 패턴</h3>
            <div className="hp-card">
              <PatternChart data={patternData} />
            </div>
          </section>
          <section className="hp-section">
            <h3 className="hp-section-title">내가 선호하는 번호</h3>
            <div className="hp-card">
              <FavoriteNumbers data={favoriteNumbers} />
            </div>
          </section>
        </div>

        <nav className="hp-tabs" role="tablist" aria-label="마이페이지 탭">
          <button
            role="tab"
            aria-selected={tab === "analysis"}
            className={`hp-tab${tab === "analysis" ? " is-active" : ""}`}
            onClick={() => {
              setTab("analysis");
              setSub("all");
            }}
          >
            분석
          </button>
          <button
            role="tab"
            aria-selected={tab === "shop"}
            className={`hp-tab${tab === "shop" ? " is-active" : ""}`}
            onClick={() => {
              setTab("shop");
              setSub("all");
            }}
          >
            판매점
          </button>
          <button
            role="tab"
            aria-selected={tab === "community"}
            className={`hp-tab${tab === "community" ? " is-active" : ""}`}
            onClick={() => {
              setTab("community");
              setSub("all");
            }}
          >
            커뮤니티
          </button>
        </nav>

        <div className="hp-subtabs">
          {tab === "analysis" ? (
            <>
              {["all", "ai", "freq", "pattern", "win", "personal"].map((k) => (
                <button key={k} className={`hp-sub${sub === k ? " on" : ""}`} onClick={() => setSub(k)}>
                  {{
                    all: "모두",
                    ai: "AI 로또 번호 추천",
                    freq: "번호빈도 통계 분석",
                    pattern: "최적패턴 통계 분석",
                    win: "당첨번호 통계 분석",
                    personal: "사용자 번호 맞춤 추천",
                  }[k]}
                </button>
              ))}
              <div className="hp-sub-search">
                <input placeholder="검색" aria-label="분석 유형 검색" />
              </div>
            </>
          ) : (
            <div className="hp-sub-guide">콘텐츠 준비 중입니다.</div>
          )}
        </div>

        {tab === "analysis" && (
          <section className="hp-table-card">
            <HistoryTable items={historyItems} />
          </section>
        )}

        <div className="hp-pagination">
          <button disabled>〈 Previous</button>
          <span className="hp-page-dot hp-active">1</span>
          <span className="hp-page-dot">2</span>
          <span className="hp-page-dot">3</span>
          <button>Next 〉</button>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
import React from "react";

function ballColor(n) {
  const num = Number(n);
  if (num >= 1 && num <= 10) return "#F2C600";
  if (num >= 11 && num <= 20) return "#2F7FD9";
  if (num >= 21 && num <= 30) return "#D64545";
  if (num >= 31 && num <= 40) return "#8B8F98";
  return "#3AA76D";
}

export default function HistoryTable({ items = [], onDetail, pageSize = 0 }) {
  const fillers = Math.max(0, pageSize - items.length);

  return (
    <div className="ht-table" role="table" aria-label="분석 이력 테이블">
      <div className="ht-head" role="row">
        <div role="columnheader" className="ht-col-round">회차</div>
        <div role="columnheader" className="ht-col-left">추천 받은 결과</div>
        <div role="columnheader" className="ht-col-action">보기</div>
      </div>

      {items.map((it, i) => (
        <div key={it.id ?? i} className="ht-row" role="row">
          <div className="ht-col-round" role="cell">{it.round ?? it.id ?? i + 1}</div>
          <div className="ht-balls ht-col-left" role="cell">
            <div className="balls-track">
              {(it.numbers || []).map((n, idx) => (
                <span key={idx} className="ball" style={{ background: ballColor(n) }}>{n}</span>
              ))}
              {it.bonus != null && (
                <>
                  <span className="ht-plus" aria-hidden="true">+</span>
                  <span className="ball bonus">{it.bonus}</span>
                </>
              )}
            </div>
          </div>
          <div className="ht-action ht-col-action" role="cell">
            <button
              className="hp-btn-outline"
              onClick={() => onDetail?.(it)}
              aria-label={`${it.round ?? i + 1}회차 상세 보기`}
            >
              {it.button || "자세히 보기"}
            </button>
          </div>
        </div>
      ))}

      {Array.from({ length: fillers }).map((_, i) => (
        <div key={`ph-${i}`} className="ht-row is-placeholder" role="presentation" aria-hidden="true">
          <div className="ht-col-round"> </div>
          <div className="ht-col-left"> </div>
          <div className="ht-col-action"> </div>
        </div>
      ))}
    </div>
  );
}
||||||| empty tree
=======
import React from "react";

function ballColor(n) {
  const num = Number(n);
  if (num >= 1 && num <= 10) return "#F2C600"; 
  if (num >= 11 && num <= 20) return "#2F7FD9";
  if (num >= 21 && num <= 30) return "#D64545";
  if (num >= 31 && num <= 40) return "#8B8F98";
  return "#3AA76D";
}

export default function HistoryTable({ items = [] }) {
  return (
    <div className="ht-table" role="table" aria-label="분석 이력 테이블">
      <div className="ht-head" role="row">
        <div role="columnheader" className="ht-col-left">추천 받은 결과</div>
        <div role="columnheader" className="ht-col-title">선택한 분석 항목</div>
        <div role="columnheader" className="ht-col-weight">가중치</div>
        <div role="columnheader" className="ht-col-summary">모델 예측 결과</div>
        <div role="columnheader" className="ht-col-action">보기</div>
        
      </div>

      {items.map((it, i) => (
        <div key={it.id ?? i} className="ht-row" role="row">
          <div className="ht-balls ht-col-left" role="cell" aria-label="추천 번호">
            <span className="ht-rank" aria-label={`순위 ${i + 1}`}>{i + 1}</span>
            <div className="balls-track">
              {(it.numbers || []).map((n, idx) => (
                <span
                  key={idx}
                  className="ball"
                  style={{ background: ballColor(n) }}
                >
                  {n}
                </span>
              ))}

              {it.bonus != null && (
                <>
                  <span
                    className="ht-plus"
                    aria-hidden="true"
                    style={{
                      margin: "0 6px",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    +
                  </span>
                  <span className="ball bonus">
                    {it.bonus}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="ht-method ht-col-title" role="cell">
            {it.method}
          </div>

          <div
            className="ht-priority ht-col-weight"
            role="cell"
            aria-label={`가중치 ${it.priority}`}
          >
            {it.priority}
          </div>

          <div className="ht-summary ht-col-summary" role="cell">
            {it.modelSummary}
          </div>

          <div className="ht-action ht-col-action" role="cell">
            <button className="hp-btn-outline" aria-label={`${it.method} 상세 보기`}>
              {it.button}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
>>>>>>> coolmean

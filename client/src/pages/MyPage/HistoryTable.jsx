import React from "react";

function ballColor(n) {
  const num = Number(n);
  if (num >= 1 && num <= 10) return "#fbc400";
  if (num >= 11 && num <= 20) return "#69c8f2";
  if (num >= 21 && num <= 30) return "#ff7272";
  if (num >= 31 && num <= 40) return "#aaaaaa";
  return "#b0d840";
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

      {items.map((it, i) => {
        const prediction = it.sample_predictions?.[0] || {};
        const predictionNumbers = it.sample_prediction_numbers?.[0] || {};

        // numbers 배열 파싱
        let numbersArr = [];
        if (predictionNumbers.numbers) {
          numbersArr = Array.isArray(predictionNumbers.numbers)
            ? predictionNumbers.numbers
            : typeof predictionNumbers.numbers === 'string'
            ? JSON.parse(predictionNumbers.numbers)
            : [];
        }

        return (
          <div key={prediction.prediction_id ?? i} className="ht-row" role="row">
            {/* 회차 표시 */}
            <div className="ht-col-round" role="cell">{prediction.draw_number}</div>
            <div className="ht-balls ht-col-left" role="cell">
              <div className="balls-track">
                {/* 추천받은 번호 */}
                {numbersArr.map((n, idx) => (
                  <span key={idx} className="ball" style={{ background: ballColor(n) }}>{n}</span>
                ))}
                {predictionNumbers.bonus_number != null && (
                  <>
                    <span className="ht-plus" aria-hidden="true">+</span>
                    <span className="ball bonus">{predictionNumbers.bonus_number}</span>
                  </>
                )}
              </div>
            </div>
            <div className="ht-action ht-col-action" role="cell">
              <button
                className="hp-btn-outline"
                onClick={() => {
                  if (prediction.settings) {
                    const settingsData = typeof prediction.settings === 'string' ? JSON.parse(prediction.settings) : prediction.settings;
                    const trueSettings = Object.entries(settingsData)
                      .filter(([_, v]) => v === true)
                      .map(([k]) => k);
                    if (trueSettings.length > 0) {
                      alert("설정 정보 (true인 항목):\n" + trueSettings.join('\n'));
                    } else {
                      alert("설정 정보 중 true인 항목이 없습니다.");
                    }
                  }
                  onDetail?.(it);
                }}
                aria-label={`${prediction.draw_number}회차 상세 보기`}
              >
                {it.button || "자세히 보기"}
              </button>
            </div>
          </div>
        );
      })}

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
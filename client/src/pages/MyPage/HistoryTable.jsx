import React from "react";

// 숫자에 따라 공 색깔을 반환하는 함수
function ballColor(n) {
  const num = Number(n);
  if (num >= 1 && num <= 10) return "#fbc400";
  if (num >= 11 && num <= 20) return "#69c8f2";
  if (num >= 21 && num <= 30) return "#ff7272";
  if (num >= 31 && num <= 40) return "#aaaaaa";
  return "#b0d840";
}

export default function HistoryTable({ items = [], onDetail, pageSize = 0 }) {
  console.log("Received items:", items);
  const fillers = Math.max(0, pageSize - items.length);

  return (
    <div className="ht-table" role="table" aria-label="분석 이력 테이블">
      <div className="ht-head" role="row">
        <div role="columnheader" className="ht-col-round">회차</div>
        <div role="columnheader" className="ht-col-left">추천 받은 결과</div>
        <div role="columnheader" className="ht-col-action">보기</div>
      </div>

      {items.map((it, i) => {
        const prediction_id = it.prediction_id;
        const draw_number = it.draw_number;

        // recommended_numbers가 문자열로 들어올 경우 처리
        const recommended_numbers = it.recommended_numbers || {};
        let numbersArr = [];
        if (recommended_numbers.numbers) {
          try {
            numbersArr = Array.isArray(recommended_numbers.numbers)
              ? recommended_numbers.numbers
              : JSON.parse(recommended_numbers.numbers);
          } catch (err) {
            console.error("추천 번호 파싱 오류:", recommended_numbers.numbers, err);
            numbersArr = [];
          }
        }

        console.log(`회차: ${draw_number || "데이터 없음"}, 추천 번호:`, numbersArr);

        const hasDrawNumber = draw_number != null && draw_number !== "";
        const hasNumbers = numbersArr.length > 0;

        return (
          <div key={prediction_id ?? i} className="ht-row" role="row">
            <div className="ht-col-round" role="cell">
              {hasDrawNumber ? draw_number : "데이터 없음"}
            </div>
            <div className="ht-balls ht-col-left" role="cell">
              <div className="balls-track">
                {hasNumbers ? (
                  <>
                    {numbersArr.map((n, idx2) => (
                      <span key={idx2} className="ball" style={{ background: ballColor(n) }}>
                        {n}
                      </span>
                    ))}
                    {recommended_numbers.bonus_number != null && (
                      <>
                        <span className="ht-plus" aria-hidden="true">+</span>
                        <span className="ball bonus">{recommended_numbers.bonus_number}</span>
                      </>
                    )}
                  </>
                ) : (
                  "데이터 없음"
                )}
              </div>
            </div>
            <div className="ht-action ht-col-action" role="cell">
              <button
                className="hp-btn-outline"
                onClick={() => {
                  if (it.settings) {
                    const settingsData = it.settings;
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
                aria-label={`${draw_number}회차 상세 보기`}
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
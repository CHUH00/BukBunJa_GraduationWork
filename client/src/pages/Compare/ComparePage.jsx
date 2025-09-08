import { useState, useEffect } from 'react';
import { getHistory } from "../../utils/api";
import LottoBall from '../../components/LottoBall';

export default function ComparePage() {
  const [search, setSearch] = useState("");
  const [selectedDraw, setSelectedDraw] = useState(''); // 기본값: 빈 문자열
  const [userSets, setUserSets] = useState([[]]);
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [bonusNumber, setBonusNumber] = useState(null);
  const [results, setResults] = useState([]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleCompare();
  };

  // 초기 비교 실행 제거됨

  const toggleNumberInSet = (setIndex, number) => {
    const newSets = [...userSets];
    const currentSet = newSets[setIndex];
    if (currentSet.includes(number)) {
      newSets[setIndex] = currentSet.filter(n => n !== number);
    } else {
      if (currentSet.length < 6) {
        newSets[setIndex] = [...currentSet, number].sort((a,b) => a-b);
      }
    }
    setUserSets(newSets);
  };

  const addUserSet = () => {
    if (userSets.length < 5) {
      setUserSets([...userSets, []]);
    }
  };

  const removeUserSet = (index) => {
    if (userSets.length > 1) {
      const newSets = userSets.filter((_, i) => i !== index);
      setUserSets(newSets);
    }
  };

  const handleCompare = async () => {
    if (!search) {
      alert('회차 번호를 입력해주세요.');
      return;
    }
    try {
      const response = await fetch(`/api/draws/${search}`);
      if (!response.ok) {
        alert('해당 회차 데이터를 불러올 수 없습니다.');
        return;
      }
      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        alert('서버에서 유효한 JSON 데이터를 받지 못했습니다.');
        return;
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        console.error('서버 응답 (JSON 파싱 실패):', text);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
        return;
      }

      // data에서 numbers 배열과 bonus_number 추출
      const exampleWinningNumbers = data.numbers;
      const exampleBonusNumber = data.bonus_number;

      setWinningNumbers(exampleWinningNumbers);
      setBonusNumber(exampleBonusNumber);
      setSelectedDraw(search);

      // 결과 계산
      const newResults = userSets.map(set => {
        const filteredSet = set.filter(n => typeof n === 'number');
        const matchCount = exampleWinningNumbers.filter(n => filteredSet.includes(n)).length;
        const bonusMatched = filteredSet.includes(exampleBonusNumber);

        let rank = 0;
        if (matchCount === 6) rank = 1;
        else if (matchCount === 5 && bonusMatched) rank = 2;
        else if (matchCount === 5) rank = 3;
        else if (matchCount === 4) rank = 4;
        else if (matchCount === 3) rank = 5;

        // 당첨금액 컬럼명
        const prizeKey = `당첨금액_${rank}`;
        const prize = rank > 0 && data.hasOwnProperty(prizeKey) ? Number(data[prizeKey]) : 0;

        return {
          numbers: set,
          matchCount,
          bonusMatched,
          rank,
          prize
        };
      });
      setResults(newResults);
    } catch (error) {
      try {
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      } catch(e) {
        // alert not available
      }
      console.error(error);
    }
  };

  const handleReset = () => {
    setUserSets([[]]);
    setWinningNumbers([]);
    setBonusNumber(null);
    setResults([]);
    setSelectedDraw('');
    setSearch('');
  };

  // 그룹별 번호 배열 생성
  const numberGroups = [
    Array.from({ length: 10 }, (_, i) => i + 1),
    Array.from({ length: 10 }, (_, i) => i + 11),
    Array.from({ length: 10 }, (_, i) => i + 21),
    Array.from({ length: 10 }, (_, i) => i + 31),
    Array.from({ length: 5 }, (_, i) => i + 41),
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>회차별 분석 결과 비교</h1>

      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyPress={handleKeyPress}
          placeholder="회차 입력"
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 6,
            flex: "0 0 150px"
          }}
          title="비교할 회차 번호를 입력하세요"
        />
        <button
          onClick={handleCompare}
          style={{ padding: '5px 15px', backgroundColor: '#7a0e0e', color: 'white', border: 'none', cursor: 'pointer' }}
          title="입력한 번호 세트와 당첨 번호를 비교합니다"
        >
          비교
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '5px 15px', backgroundColor: '#7a0e0e', color: 'white', border: 'none', cursor: 'pointer' }}
          title="모든 입력과 결과를 초기화합니다"
        >
          초기화
        </button>
      </div>

      {/* 사용자 번호 세트 입력 */}
      <div style={{ marginBottom: 20 }}>
        {userSets.map((set, setIndex) => (
          <div key={setIndex} style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 6, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <span>{setIndex + 1}번 세트 번호 선택 (최대 6개)</span>
              <button
                onClick={() => removeUserSet(setIndex)}
                disabled={userSets.length === 1}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#7a0e0e',
                  color: 'white',
                  border: 'none',
                  cursor: userSets.length === 1 ? 'not-allowed' : 'pointer',
                  marginLeft: 10
                }}
                title="번호 세트 삭제"
              >
                삭제
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 300 }}>
              {numberGroups.map((group, groupIndex) => (
                <div key={groupIndex} style={{ display: 'flex', gap: 6 }}>
                  {group.map(num => {
                    const isSelected = userSets[setIndex].includes(num);
                    return (
                      <div
                        key={num}
                        onClick={() => toggleNumberInSet(setIndex, num)}
                        style={{
                          width: 36,
                          height: 36,
                          lineHeight: '36px',
                          textAlign: 'center',
                          borderRadius: '50%',
                          border: '1px solid #ccc',
                          cursor: isSelected || userSets[setIndex].length < 6 ? 'pointer' : 'not-allowed',
                          backgroundColor: isSelected ? '#7a0e0e' : 'white',
                          color: isSelected ? 'white' : 'black',
                          userSelect: 'none',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}
                        title={isSelected ? `${num}번 선택됨 (클릭하여 해제)` : userSets[setIndex].length < 6 ? `${num}번 선택` : '최대 6개까지만 선택 가능합니다'}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addUserSet}
          disabled={userSets.length >= 5}
          style={{
            padding: '6px 12px',
            backgroundColor: userSets.length >= 5 ? '#ccc' : '#7a0e0e',
            color: 'white',
            border: 'none',
            cursor: userSets.length >= 5 ? 'not-allowed' : 'pointer',
            marginTop: 10,
          }}
          title={userSets.length >= 5 ? '최대 5세트까지 추가 가능합니다' : '새 번호 세트 추가'}
        >
          번호 세트 추가
        </button>
      </div>

      {/* 당첨 결과 테이블 */}
      {winningNumbers.length > 0 && (
        <div>
          <h2 style={{ textAlign: 'center' }}>{selectedDraw}회차 결과</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>번호 세트</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>번호</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>맞춘 개수</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>등수</th>
                <th style={{ border: '1px solid #ddd', padding: 8 }}>예상 당첨금액</th>
              </tr>
            </thead>
            <tbody>
              {/* 당첨 번호 항상 맨 위에 표시 */}
              <tr style={{ backgroundColor: '#fafafa' }}>
                <td style={{ border: '1px solid #ddd', padding: 8, fontWeight: 'bold' }}>당첨 번호</td>
                <td colSpan={4} style={{ border: '1px solid #ddd', padding: 8, display: 'flex', gap: 6, justifyContent: 'center', verticalAlign: 'middle', alignItems: 'center' }}>
                  {winningNumbers.map((n, i) => (
                    <LottoBall key={i} number={n} />
                  ))}
                  <span style={{ fontWeight: 'bold', fontSize: '1.2em', margin: '0 8px' }}>+</span>
                  <LottoBall number={bonusNumber} />
                </td>
              </tr>
              {/* 사용자 세트 결과 */}
              {results.map((res, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ border: '1px solid #ddd', padding: 8, verticalAlign: 'middle' }}>{idx + 1}번 세트</td>
                  <td style={{ border: '1px solid #ddd', padding: 8, display: 'flex', justifyContent: 'center', gap: 6, verticalAlign: 'middle' }}>
                    {res.numbers.map((num, i) => {
                      return (
                        <div key={i} style={{ borderRadius: '50%' }}>
                          <LottoBall number={num} />
                        </div>
                      );
                    })}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: 8, verticalAlign: 'middle' }}>{res.matchCount}{res.bonusMatched ? ' + 보너스' : ''}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8, verticalAlign: 'middle' }}>{res.rank > 0 ? `${res.rank}등` : '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8, verticalAlign: 'middle' }}>{res.prize.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
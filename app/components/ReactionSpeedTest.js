'use client';

import React, { useState, useEffect } from 'react';

const ReactionSpeedTest = () => {
  // 초기 상태 설정
  const [grid, setGrid] = useState(Array(9).fill(false)); // 타일 활성 상태
  const [activeIndex, setActiveIndex] = useState(null); // 현재 활성화된 타일 인덱스
  const [started, setStarted] = useState(false); // 테스트 시작 여부
  const [success, setSuccess] = useState(false); // 성공 여부
  const [clickTimes, setClickTimes] = useState([]); // 반응 시간 목록
  const [activeTimestamp, setActiveTimestamp] = useState(null); // 타일 활성화 시간
  const [latestClickTime, setLatestClickTime] = useState(null); // 최근 반응 시간

  // 테스트 시작 후 일정 간격마다 타일 활성화
  useEffect(() => {
    let interval;
    if (started) {
      interval = setInterval(() => {
        // 남은 타일 중에서 무작위로 타일 활성화
        const availableTiles = grid
          .map((tile, index) => (!tile ? index : null))
          .filter((index) => index !== null);

        // 모든 타일이 성공적으로 클릭된 경우 인터벌 종료
        if (availableTiles.length === 0) return clearInterval(interval);

        // 무작위로 새로운 활성 타일 선택
        const newActiveIndex = availableTiles[Math.floor(Math.random() * availableTiles.length)];
        setActiveIndex(newActiveIndex);
        setActiveTimestamp(performance.now());
        setClickTimes((prevTimes) => [...prevTimes, null]); // 클릭 시간 자리 추가
      }, 1200+Math.random()*800);
    }
    return () => clearInterval(interval); // 컴포넌트 해제 시 인터벌 종료
  }, [started, grid]);

  // 타일 클릭 핸들러
  const handleTileClick = (index) => {
    if (index === activeIndex) {
      // 성공적으로 클릭 시 타일 업데이트
      const updatedGrid = [...grid];
      updatedGrid[index] = true;
      setGrid(updatedGrid);
      setActiveIndex(null); // 현재 활성화 타일 초기화

      // 클릭 반응 시간 계산
      const now = performance.now();
      const reactionTime = now - activeTimestamp;
      setLatestClickTime(reactionTime); // 최근 반응 시간 업데이트
      const updatedClickTimes = [...clickTimes];
      updatedClickTimes[updatedClickTimes.length - 1] = reactionTime;
      setClickTimes(updatedClickTimes);

      // 모든 타일 성공 클릭 확인
      if (updatedGrid.every((tile) => tile)) {
        setSuccess(true);
        const averageReactionTime =
          updatedClickTimes.reduce((sum, time) => sum + time, 0) / updatedClickTimes.length;
        alert(`성공! 평균 반응속도는 ${averageReactionTime.toFixed(2)}ms입니다.`);
      }
    } else {
      // 잘못된 타일 클릭 시 실패 메시지 및 새로고침
      alert('잘못된 타일을 선택했습니다.');
      window.location.reload();
    }
  };

  // 테스트 시작 핸들러
  const handleStart = () => setStarted(true);

  // 홈으로 돌아가기 핸들러
  const handleGoHome = () => (window.location.href = '/');

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Reaction Speed Test</h1>
      
      {/* 시작 버튼 */}
      {!started && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
          onClick={handleStart}
        >
          Start
        </button>
      )}

      {/* 타일 그리드 */}
      <div className="grid grid-cols-3 gap-4">
        {grid.map((tile, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex items-center justify-center cursor-pointer
              ${tile ? 'bg-gray-100' : activeIndex === index ? 'bg-red-500 text-white' : 'bg-blue-300'}
            `}
            onClick={() => !tile && handleTileClick(index)} // 이미 클릭된 타일 클릭 비활성화
          >
            {activeIndex === index && !tile ? 'Click me!' : ''}
          </div>
        ))}
      </div>

      {/* 클릭 반응 속도 표시 */}
      {latestClickTime && (
        <div className="mt-8">
          <p>반응속도: {latestClickTime.toFixed(2)}ms</p>
        </div>
      )}

      {/* 성공 시 평균 반응 속도 및 홈으로 돌아가기 버튼 */}
      {success && (
        <div className="mt-8 flex flex-col items-center">
          <p>당신의 평균 반응속도는 {(clickTimes.reduce((sum, time) => sum + time, 0) / clickTimes.length).toFixed(2)}ms입니다.</p>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleGoHome}
          >
            Go Home
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionSpeedTest;

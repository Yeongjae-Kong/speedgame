import React, { useState, useEffect } from 'react';

const ReactionSpeedTest = () => {
  const [grid, setGrid] = useState(Array(9).fill(false));
  const [activeIndex, setActiveIndex] = useState(null);
  const [started, setStarted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clickTimes, setClickTimes] = useState([]);
  const [activeTimestamp, setActiveTimestamp] = useState(null);
  const [latestClickTime, setLatestClickTime] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let countdownTimeout;

    if (started && countdown > 0) {
      // 각 숫자 표시 후 fade-out 효과
      setFadeOut(false); // 초기 상태에서 fade-out 해제

      countdownTimeout = setTimeout(() => {
        setFadeOut(true); // fade-out 시작

        // fade-out이 끝난 후 카운트다운 업데이트
        setTimeout(() => {
          setFadeOut(false); // fade-out 해제
          setCountdown((prev) => {
            if (prev === 1) {
              startGame(); // 마지막 숫자 fade-out 후 게임 시작
              return 0; // 카운트다운을 0으로 변경
            }
            return prev - 1; // 카운트다운 진행
          });
        }, 400); // 1초 대기 후 다음 숫자 표시
      }, 1000); // 각 숫자가 1초 간격으로 fade-out

      return () => clearTimeout(countdownTimeout);
    }

    return () => clearTimeout(countdownTimeout);
  }, [started, countdown]);

  const startGame = () => {
    setStarted(true);
    setCountdown(null); // 게임 시작 시 카운트다운 초기화
    setGrid(Array(9).fill(false));
    setActiveIndex(null);
    setSuccess(false);
    setClickTimes([]);
    setLatestClickTime(null);
  };

  useEffect(() => {
    let interval;
    if (started) {
      interval = setInterval(() => {
        const availableTiles = grid
          .map((tile, index) => (!tile ? index : null))
          .filter((index) => index !== null);

        if (availableTiles.length === 0) return clearInterval(interval);

        const newActiveIndex = availableTiles[Math.floor(Math.random() * availableTiles.length)];
        setActiveIndex(newActiveIndex);
        setActiveTimestamp(performance.now());
        setClickTimes((prevTimes) => [...prevTimes, null]);
      }, 1000 + Math.random() * 1200);
    }
    return () => clearInterval(interval);
  }, [started, grid]);

  const handleTileClick = (index) => {
    if (index === activeIndex) {
      const updatedGrid = [...grid];
      updatedGrid[index] = true;
      setGrid(updatedGrid);
      setActiveIndex(null);

      const now = performance.now();
      const reactionTime = now - activeTimestamp;
      setLatestClickTime(reactionTime);
      const updatedClickTimes = [...clickTimes];
      updatedClickTimes[updatedClickTimes.length - 1] = reactionTime;
      setClickTimes(updatedClickTimes);

      if (updatedGrid.every((tile) => tile)) {
        setSuccess(true);
        const averageReactionTime =
          updatedClickTimes.reduce((sum, time) => sum + time, 0) / updatedClickTimes.length;
        alert(`성공! 평균 반응속도는 ${averageReactionTime.toFixed(2)}ms입니다.`);
      }
    } else {
      alert('잘못된 타일을 선택했습니다.');
      window.location.reload();
    }
  };

  const handleGoHome = () => (window.location.href = '/');

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!started || countdown === null ? (
        <h1 className="text-4xl font-bold mb-8">Reaction Speed Test</h1>
      ) : null}

      {!started && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8"
          onClick={() => {
            setStarted(true);
            setCountdown(3);
          }}
        >
          Start
        </button>
      )}

      {started && countdown > 0 && (
        <div
          className={`text-8xl font-bold transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          {countdown}
        </div>
      )}

      {started && countdown === null && (
        <div className="grid grid-cols-3 gap-4">
          {grid.map((tile, index) => (
            <div
              key={index}
              className={`w-20 h-20 flex items-center justify-center cursor-pointer
                ${tile ? 'bg-gray-100' : activeIndex === index ? 'bg-red-500 text-white' : 'bg-blue-300'}
                rounded-lg
              `}
              onClick={() => !tile && handleTileClick(index)}
            >
              {activeIndex === index && !tile ? 'Click me!' : ''}
            </div>
          ))}
        </div>
      )}

      {latestClickTime && (
        <div className="mt-8">
          <p>반응속도: {latestClickTime.toFixed(2)}ms</p>
        </div>
      )}

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

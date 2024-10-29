import React, { useState, useEffect, useRef } from 'react';

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
  const [testType, setTestType] = useState('reaction');
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [remainingAttempts, setRemainingAttempts] = useState(10);
  const [scores, setScores] = useState([]);
  const [progress, setProgress] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentScore, setCurrentScore] = useState(null);  // 현재 클릭의 점수
  const [averageScore, setAverageScore] = useState(null);  // 평균 점수

  const startTimeRef = useRef(null);

  useEffect(() => {
    let countdownTimeout;

    if (started && countdown > 0) {
      setFadeOut(false);

      countdownTimeout = setTimeout(() => {
        setFadeOut(true);

        setTimeout(() => {
          setFadeOut(false);
          setCountdown((prev) => {
            if (prev === 1) {
              startGame();
              setGameStarted(true);
              return 0;
            }
            return prev - 1;
          });
        }, 400);
      }, 1000);
      
      return () => clearTimeout(countdownTimeout);
    }

    return () => clearTimeout(countdownTimeout);
  }, [started, countdown]);

  useEffect(() => {
    let timer;
    
    if (gameStarted && !success) {
      const totalDuration = 20000;
      // 게임이 처음 시작될 때만 시작 시간을 설정
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTimeRef.current;
        const remainingTime = totalDuration - elapsedTime;
        
        // 남은 시간이 0보다 작으면 0으로 설정
        const progressValue = Math.max((remainingTime / totalDuration) * 100, 0);
        setProgress(progressValue);

        if (remainingTime <= 0) {
          clearInterval(timer);
          if (remainingAttempts > 0) {
            alert("시간 초과!");
            handleGoHome();
          }
        }
      }, 100);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameStarted, success]); // remainingAttempts 제거하여 클릭할 때마다 리셋되는 것 방지


  const startGame = () => {
    setStarted(true);
    setCountdown(null);
    setGrid(Array(9).fill(false));
    setActiveIndex(null);
    setSuccess(false);
    setClickTimes([]);
    setLatestClickTime(null);
    setScores([]);
    setCurrentScore(null);
    setAverageScore(null);
    startTimeRef.current = null;
    createTarget();
  };

  const createTarget = () => {
    const randomY = window.innerHeight / 4 + Math.random() * (window.innerHeight / 2);
    const randomSide = Math.random() < 0.5 ? 'left' : 'right';
    const newX = randomSide === 'left' ? window.innerWidth/4 : 3*window.innerWidth/4;
    setTargetPosition({ x: newX, y: randomY, p: randomSide });
  };
  
  useEffect(() => {
    let interval;

    if (started && testType === 'reaction') {
      interval = setInterval(() => {
        const availableTiles = grid
          .map((tile, index) => (!tile ? index : null))
          .filter((index) => index !== null);

        if (availableTiles.length === 0) return clearInterval(interval);

        const newActiveIndex = availableTiles[Math.floor(Math.random() * availableTiles.length)];
        setActiveIndex(newActiveIndex);
        setActiveTimestamp(performance.now());
        setClickTimes((prevTimes) => [...prevTimes, null]);
      }, 1000 + Math.random() * 1000);
    }

    return () => clearInterval(interval);
  }, [started, grid, testType]);

  useEffect(() => {
    let targetInterval;
    let position = targetPosition.x;
  
    if (started && testType === 'accuracy') {
      targetInterval = setInterval(() => {
        setTargetPosition((prev) => {
          const direction = prev.p === 'left' ? 1 : -1;
          position += 2 * direction;
  
          if (position > 3*window.innerWidth/4) {
            createTarget();
          } else if (position < window.innerWidth/4) {
            createTarget();
          }
  
          return { x: position, y: prev.y, p: prev.p };
        });
      }, 17);
    }
  
    return () => clearInterval(targetInterval);
  }, [started, testType, targetPosition]);

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
        setGameStarted(false);
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

  const handleStartAccuracyTest = () => {
    setTestType('accuracy');
    setStarted(true);
    setCountdown(3);
    createTarget();
  };

  const calculateScore = (clickX, clickY) => {
    const centerX = targetPosition.x;
    const centerY = targetPosition.y;
    const distance = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
  
    if (distance < 3) return 10;
    else if (distance < 5) return 9.95;
    else if (distance < 7) return 9.9;
    else if (distance < 9) return 9.85;
    else if (distance < 11) return 9.7;
    else if (distance < 13) return 9.6;
    else if (distance < 15) return 9.35;
    else if (distance < 17) return 9.1;
    else if (distance < 20) return 8.85;
    else if (distance < 22) return 8.4;
    else if (distance < 24) return 8.1;
    else if (distance < 27) return 7.7;
    else if (distance < 30) return 7.35;
    else if (distance < 33) return 6.6;
    else if (distance < 35) return 5.85;
    else return 5;
  };
  
  const handleTargetClick = (e) => {
    e.stopPropagation();
    const newScore = calculateScore(e.clientX, e.clientY);
    setCurrentScore(newScore);  // 현재 클릭의 점수 설정
    setScores(prevScores => [...prevScores, newScore]);
    setRemainingAttempts(prevAttempts => prevAttempts - 1);

    // 평균 점수 계산 및 업데이트
    const newScores = [...scores, newScore];
    const newAverage = newScores.reduce((sum, s) => sum + s, 0) / newScores.length;
    setAverageScore(newAverage);

    if (remainingAttempts - 1 === 0) {
      setSuccess(true);
      setGameStarted(false);
      setTimeout(() => {
        alert(`성공! 평균 정확도는 ${newAverage.toFixed(2)}점입니다.`);
      }, 100);
    } else {
      createTarget();
    }
  };

  return (
    <div>
      <div>
        {gameStarted && !success && (
          <div
            style={{
              height: '10px',
              width: `${progress}%`,
              backgroundColor: 'blue',
              transition: 'width 0.1s linear',
              position: 'fixed',
              top: 0,
              left: 0,
              opacity: 0.5
            }}
          />
        )}
      </div>
      <div className="flex flex-col items-center justify-center h-screen">
        {!started || countdown === null ? (
          <h1
            className={`text-4xl font-bold mb-8 transition-opacity duration-500 ${
              started && countdown === null ? 'opacity-20' : 'opacity-100'
            }`}
          >
            Reaction Speed Test
          </h1>
        ) : null}

        {!started && (
          <>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8 min-w-[200px]"
              onClick={() => {
                setStarted(true);
                setTestType('reaction');
                setCountdown(3);
              }}
            >
              반응속도 테스트
            </button>

            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 min-w-[200px]"
              onClick={handleStartAccuracyTest}
            >
              정확도 테스트
            </button>
          </>
        )}

        {started && countdown > 0 && (
          <div
            className={`text-8xl font-bold transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
          >
            {countdown}
          </div>
        )}

        {started && countdown === null && !success && (
          <>
            {testType === 'reaction' ? (
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
            ) : (
              <div>
                <div
                  className="absolute text-[10rem] opacity-20"
                  style={{
                    top: '60%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {remainingAttempts}
                </div>
                <div
                  className="relative"
                  style={{
                    position: 'absolute',
                    left: targetPosition.x,
                    top: targetPosition.y,
                    transform: 'translate(-50%, -50%)',
                    width: '100px',
                    height: '100px',
                  }}
                  onClick={handleTargetClick}
                >
                  <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#FF0000', width: '100%', height: '100%' }} />
                  <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#FF7F00', width: '75%', height: '75%', top: '12.5%', left: '12.5%' }} />
                  <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#FFFF00', width: '50%', height: '50%', top: '25%', left: '25%' }} />
                  <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#00FF00', width: '25%', height: '25%', top: '37.5%', left: '37.5%' }} />
                </div>
              </div>
            )}
          </>
        )}
        
        {/* 점수 표시 섹션 */}
        <div className="mt-6 text-center">
          {latestClickTime && testType === 'reaction' && !success && (
            <p>반응속도: {latestClickTime.toFixed(2)}ms</p>
          )}
          {testType === 'reaction' && success && (
          <p>당신의 평균 반응속도는 {(clickTimes.reduce((sum, time) => sum + time, 0) / clickTimes.length).toFixed(2)}ms입니다.</p>
          )}
          {testType === 'accuracy' && currentScore !== null && (
            <>
              {!success && (
                <p>정확도: {currentScore.toFixed(2)} 점</p>
              )}
              {averageScore !== null && success && (
                <p>당신의 평균 정확도는 {averageScore.toFixed(2)} 점입니다.</p>
              )}
            </>
          )}
        </div>

        {success && (
          <div className="relative z-50">
            <button
              className="bg-green-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-6"
              onClick={handleGoHome}
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionSpeedTest;
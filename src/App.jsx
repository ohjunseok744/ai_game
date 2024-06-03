import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import GameOver from './components/GameOver';
import BoardDisplay from './components/BoardDisplay';
import ScoreBoard from './components/ScoreBoard';
import './App.css';

const size = 4;

// 게임 보드 내에서 랜덤한 위치를 얻는 함수
const getRandomPosition = () => {
  return {
    x: Math.floor(Math.random() * size),
    y: Math.floor(Math.random() * size)
  };
};

// 기존 위치를 피하여 고유한 랜덤 위치를 얻는 함수
const getUniqueRandomPosition = (existingPositions) => {
  let newPosition;
  do {
    newPosition = getRandomPosition();
  } while (existingPositions.some(pos => pos.x === newPosition.x && pos.y === newPosition.y));
  return newPosition;
};

// 4x4 그리드로 게임 보드를 초기화하고 초기 에이전트 위치를 설정하는 함수
const initializeBoard = () => {
  const board = Array(size).fill(0).map(() => Array(size).fill(0));
  board[0][0] = 'E'; // 0,0 위치를 'E'로 설정
  return board;
};

// 금의 위치를 기준으로 휴리스틱 값을 사용하여 점수판을 초기화하는 함수
const initializeScoreBoard = (goldPosition) => {
  const board = Array(size).fill(0).map((_, x) =>
    Array(size).fill(0).map((_, y) =>
      calculateHeuristic({ x, y }, goldPosition)
    )
  );
  return board;
};

// 금의 위치를 기준으로 각 셀의 휴리스틱 점수를 계산하는 함수
const calculateHeuristic = (position, goldPosition) => {
  if (position.x === goldPosition.x && position.y === goldPosition.y) {
    return 1000;
  }
  const distance = Math.abs(position.x - goldPosition.x) + Math.abs(position.y - goldPosition.y);
  return 10 - distance; // 금에 가까울수록 높은 점수
};

// 보드의 특정 위치에 심볼을 업데이트하는 함수
const updateBoard = (board, position, symbol) => {
  board[position.x][position.y] = symbol;
};

// 특정 위치의 인접한 위치들을 얻는 함수
const getAdjacentPositions = (position) => {
  return [
    { x: position.x - 1, y: position.y },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y - 1 },
    { x: position.x, y: position.y + 1 }
  ].filter(pos => pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size);
};

const App = () => {
  const [agentPosition, setAgentPosition] = useState({ x: 0, y: 0 });
  const [wumpusPosition, setWumpusPosition] = useState(getUniqueRandomPosition([{ x: 0, y: 0 }]));
  const [pitPosition, setPitPosition] = useState(getUniqueRandomPosition([{ x: 0, y: 0 }, wumpusPosition]));
  const [goldPosition, setGoldPosition] = useState(getUniqueRandomPosition([{ x: 0, y: 0 }, wumpusPosition, pitPosition]));
  const [stenchPositions, setStenchPositions] = useState([]);
  const [breezePositions, setBreezePositions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showWumpus, setShowWumpus] = useState(false);
  const [showPit, setShowPit] = useState(false);
  const [hasGold, setHasGold] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [agentBoard, setAgentBoard] = useState(initializeBoard());
  const [actualBoard, setActualBoard] = useState(initializeBoard());
  const [scoreBoard, setScoreBoard] = useState(initializeScoreBoard(goldPosition));
  const [visitedPositions, setVisitedPositions] = useState([]);
  const [wumpusAlive, setWumpusAlive] = useState(true); // 추가 상태
  const [arrowPosition, setArrowPosition] = useState(null); // 화살 위치 상태

  // Wumpus와 Pit 위치에 따라 Stench와 Breeze 위치를 설정
  useEffect(() => {
    setStenchPositions(getAdjacentPositions(wumpusPosition));
    setBreezePositions(getAdjacentPositions(pitPosition));
  }, [wumpusPosition, pitPosition]);

  // Wumpus, Pit, Gold 및 관련 위치에 따라 실제 보드를 업데이트
  useEffect(() => {
    const newActualBoard = initializeBoard();
    if (wumpusAlive) {
      updateBoard(newActualBoard, wumpusPosition, 'W');
    }
    updateBoard(newActualBoard, pitPosition, 'P');
    updateBoard(newActualBoard, goldPosition, 'G');
    stenchPositions.forEach(pos => updateBoard(newActualBoard, pos, 'S'));
    breezePositions.forEach(pos => updateBoard(newActualBoard, pos, 'B'));
    setActualBoard(newActualBoard);
  }, [wumpusPosition, pitPosition, goldPosition, stenchPositions, breezePositions, wumpusAlive]);

  // 에이전트 위치를 업데이트하는 함수
  const updateAgentPosition = (x, y) => {
    const prevPosition = { ...agentPosition };
    setAgentPosition({ x, y });

    // 게임 오버 조건
    if (wumpusAlive && x === wumpusPosition.x && y === wumpusPosition.y) {
      setGameOver(true);
      setShowWumpus(true);
      setShowPit(false);
      return;
    } else if (x === pitPosition.x && y === pitPosition.y) {
      setGameOver(true);
      setShowPit(true);
      setShowWumpus(false);
      return;
    } else if (x === goldPosition.x && y === goldPosition.y && !hasGold) {
      setHasGold(true);
    } else if (x === 0 && y === 0 && hasGold) {
      setGameSuccess(true);
    }

    const newVisitedPositions = [...visitedPositions, { x, y }];
    setVisitedPositions(newVisitedPositions);

    const newAgentBoard = [...agentBoard];
    if (newAgentBoard[x][y] === 0) {
      if (stenchPositions.some(pos => pos.x === x && pos.y === y)) {
        newAgentBoard[x][y] = 'S';
        shootArrow({ x, y });
      } else if (breezePositions.some(pos => pos.x === x && pos.y === y)) {
        newAgentBoard[x][y] = 'B';
      } else {
        newAgentBoard[x][y] = 'E'; // 빈 칸을 'E'로 설정
      }
    }
    setAgentBoard(newAgentBoard);

    const newScoreBoard = scoreBoard.map(row => [...row]);

    const adjacentPositions = getAdjacentPositions({ x, y });
    if (stenchPositions.some(pos => pos.x === x && pos.y === y) || breezePositions.some(pos => pos.x === x && pos.y === y)) {
      adjacentPositions.forEach(pos => {
        if (!(pos.x === prevPosition.x && pos.y === prevPosition.y)) {
          newScoreBoard[pos.x][pos.y] -= 5;
        }
      });
    } else {
      adjacentPositions.forEach(pos => {
        if (!(pos.x === prevPosition.x && pos.y === prevPosition.y)) {
          newScoreBoard[pos.x][pos.y] += 10;
        }
      });
    }

    newScoreBoard[x][y] -= 3; // 방문한 칸의 점수를 -3로 감소
    setScoreBoard(newScoreBoard);
  };

  // 화살을 쏘는 함수
  const shootArrow = (position) => {
    const adjacentPositions = getAdjacentPositions(position);
    const lowestScorePosition = adjacentPositions.reduce((lowest, pos) => {
      if (!lowest) return pos;
      return scoreBoard[pos.x][pos.y] < scoreBoard[lowest.x][lowest.y] ? pos : lowest;
    }, null);

    if (lowestScorePosition) {
      setArrowPosition(lowestScorePosition);
      setTimeout(() => {
        setArrowPosition(null);
        if (lowestScorePosition.x === wumpusPosition.x && lowestScorePosition.y === wumpusPosition.y) {
          setWumpusAlive(false);
          const newActualBoard = initializeBoard();
          updateBoard(newActualBoard, pitPosition, 'P');
          updateBoard(newActualBoard, goldPosition, 'G');
          breezePositions.forEach(pos => updateBoard(newActualBoard, pos, 'B'));
          setActualBoard(newActualBoard);
        }
      }, 500);
    }
  };

  // AI 실행 함수
  const executeAI = async () => {
    let currentPosition = agentPosition;
    const path = [currentPosition];

    while (!(currentPosition.x === goldPosition.x && currentPosition.y === goldPosition.y)) {
      const adjacentPositions = getAdjacentPositions(currentPosition);
      const nextPosition = adjacentPositions.reduce((bestPos, pos) => {
        if (!bestPos) return pos;
        return scoreBoard[pos.x][pos.y] > scoreBoard[bestPos.x][bestPos.y] ? pos : bestPos;
      }, null);

      if (!nextPosition) break;

      path.push(nextPosition);
      currentPosition = nextPosition;
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateAgentPosition(currentPosition.x, currentPosition.y);

      if (currentPosition.x === goldPosition.x && currentPosition.y === goldPosition.y) {
        setHasGold(true);
        break;
      }
    }

    for (let i = path.length - 2; i >= 0; i--) {
      const { x, y } = path[i];
      await new Promise(resolve => setTimeout(resolve, 500));
      updateAgentPosition(x, y);

      if (x === 0 && y === 0) {
        setGameSuccess(true);
        break;
      }
    }
  };

  // 에이전트를 위로 이동시키는 함수
  const moveUp = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (x > 0) x--;
    updateAgentPosition(x, y);
  };

  // 에이전트를 아래로 이동시키는 함수
  const moveDown = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (x < size - 1) x++;
    updateAgentPosition(x, y);
  };

  // 에이전트를 왼쪽으로 이동시키는 함수
  const moveLeft = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (y > 0) y--;
    updateAgentPosition(x, y);
  };

  // 에이전트를 오른쪽으로 이동시키는 함수
  const moveRight = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (y < size - 1) y++;
    updateAgentPosition(x, y);
  };

  // 새로운 게임을 시작하는 함수
  const startNewGame = () => {
    setAgentPosition({ x: 0, y: 0 });
    setWumpusPosition(getUniqueRandomPosition([{ x: 0, y: 0 }]));
    setPitPosition(getUniqueRandomPosition([{ x: 0, y: 0 }, wumpusPosition]));
    setGoldPosition(getUniqueRandomPosition([{ x: 0, y: 0 }, wumpusPosition, pitPosition]));
    setGameOver(false);
    setShowWumpus(false);
    setShowPit(false);
    setHasGold(false);
    setGameSuccess(false);
    setAgentBoard(initializeBoard());
    setScoreBoard(initializeScoreBoard(goldPosition));
    setVisitedPositions([]);
    setWumpusAlive(true);
    setArrowPosition(null);
  };

  return (
    <div className="App">
      <div className="gameContainer">
        <GameBoard
          size={size}
          agentPosition={agentPosition}
          goldPosition={goldPosition}
          hasGold={hasGold}
          stenchPositions={stenchPositions}
          breezePositions={breezePositions}
          wumpusPosition={wumpusPosition}
          pitPosition={pitPosition}
          wumpusAlive={wumpusAlive}
          arrowPosition={arrowPosition}
        />
        <Controls moveUp={moveUp} moveDown={moveDown} moveLeft={moveLeft} moveRight={moveRight} executeAI={executeAI} />
      </div>
      <GameOver
        gameOver={gameOver}
        showWumpus={showWumpus}
        showPit={showPit}
        gameSuccess={gameSuccess}
        resetGame={startNewGame}
        startNewGame={startNewGame}
      />
      <div className="boardContainer">
        <h3>Score Board</h3>
        <ScoreBoard board={scoreBoard} />
        <h3>Actual Board</h3>
        <BoardDisplay board={actualBoard} />
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import GameOver from './components/GameOver';
import BoardDisplay from './components/BoardDisplay';
import ScoreBoard from './components/ScoreBoard';
import './App.css';

const size = 4;

const getRandomPosition = () => {
  return {
    x: Math.floor(Math.random() * size),
    y: Math.floor(Math.random() * size)
  };
};

const getUniqueRandomPosition = (existingPositions) => {
  let newPosition;
  do {
    newPosition = getRandomPosition();
  } while (existingPositions.some(pos => pos.x === newPosition.x && pos.y === newPosition.y));
  return newPosition;
};

const initializeBoard = () => {
  const board = Array(size).fill(0).map(() => Array(size).fill(0));
  board[0][0] = 'E'; // Fix the 0,0 position to 'E'
  return board;
};

const initializeScoreBoard = (goldPosition) => {
  const board = Array(size).fill(0).map((_, x) =>
    Array(size).fill(0).map((_, y) =>
      calculateHeuristic({ x, y }, goldPosition)
    )
  );
  return board;
};

const calculateHeuristic = (position, goldPosition) => {
  if (position.x === goldPosition.x && position.y === goldPosition.y) {
    return 1000;
  }
  const distance = Math.abs(position.x - goldPosition.x) + Math.abs(position.y - goldPosition.y);
  return 10 - distance; // Example heuristic: closer to gold gets higher score
};

const updateBoard = (board, position, symbol) => {
  board[position.x][position.y] = symbol;
};

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
  const [showpit, setShowpit] = useState(false);
  const [hasGold, setHasGold] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [agentBoard, setAgentBoard] = useState(initializeBoard());
  const [actualBoard, setActualBoard] = useState(initializeBoard());
  const [scoreBoard, setScoreBoard] = useState(initializeScoreBoard(goldPosition));
  const [visitedPositions, setVisitedPositions] = useState([]);

  useEffect(() => {
    setStenchPositions(getAdjacentPositions(wumpusPosition));
    setBreezePositions(getAdjacentPositions(pitPosition));
  }, [wumpusPosition, pitPosition]);

  useEffect(() => {
    const newActualBoard = initializeBoard();
    updateBoard(newActualBoard, wumpusPosition, 'W');
    updateBoard(newActualBoard, pitPosition, 'P');
    updateBoard(newActualBoard, goldPosition, 'G');
    stenchPositions.forEach(pos => updateBoard(newActualBoard, pos, 'S'));
    breezePositions.forEach(pos => updateBoard(newActualBoard, pos, 'B'));
    setActualBoard(newActualBoard);
  }, [wumpusPosition, pitPosition, goldPosition, stenchPositions, breezePositions]);

  const updateAgentPosition = (x, y) => {
    const prevPosition = { ...agentPosition };
    setAgentPosition({ x, y });

    if (x === wumpusPosition.x && y === wumpusPosition.y) {
      setGameOver(true);
      setShowWumpus(true);
      setShowpit(false);
      return;
    } else if (x === pitPosition.x && y === pitPosition.y) {
      setGameOver(true);
      setShowpit(true);
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
      } else if (breezePositions.some(pos => pos.x === x && pos.y === y)) {
        newAgentBoard[x][y] = 'B';
      } else {
        newAgentBoard[x][y] = 'E'; // E for empty
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

    newScoreBoard[x][y] -= 3;  // 방문한 칸의 점수를 -3로 감소
    setScoreBoard(newScoreBoard);
  };

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
      await new Promise(resolve => setTimeout(resolve, 500));
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

  const moveUp = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (x > 0) x--;
    updateAgentPosition(x, y);
  };

  const moveDown = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (x < size - 1) x++;
    updateAgentPosition(x, y);
  };

  const moveLeft = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (y > 0) y--;
    updateAgentPosition(x, y);
  };

  const moveRight = () => {
    if (gameOver || gameSuccess) return;
    let { x, y } = agentPosition;
    if (y < size - 1) y++;
    updateAgentPosition(x, y);
  };

  const startNewGame = () => {
    setAgentPosition({ x: 0, y: 0 });
    setWumpusPosition(getUniqueRandomPosition([{ x: 0, y: 0 }]));
    setPitPosition(getUniqueRandomPosition([{ x: 0, y: 0 }, wumpusPosition]));
    setGoldPosition(getUniqueRandomPosition([{ x: 0, y: 0 }, wumpusPosition, pitPosition]));
    setGameOver(false);
    setShowWumpus(false);
    setShowpit(false);
    setHasGold(false);
    setGameSuccess(false);
    setAgentBoard(initializeBoard());
    setScoreBoard(initializeScoreBoard(goldPosition));
    setVisitedPositions([]);
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
        />
        <Controls moveUp={moveUp} moveDown={moveDown} moveLeft={moveLeft} moveRight={moveRight} executeAI={executeAI} />
      </div>
      <GameOver
        gameOver={gameOver}
        showWumpus={showWumpus}
        showpit={showpit}
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

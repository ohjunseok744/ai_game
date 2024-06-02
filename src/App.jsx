import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import GameOver from './components/GameOver';
import BoardDisplay from './components/BoardDisplay';
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

const updateBoard = (board, position, symbol) => {
  board[position.x][position.y] = symbol;
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

  useEffect(() => {
    const getAdjacentPositions = (position) => {
      return [
        { x: position.x - 1, y: position.y },
        { x: position.x + 1, y: position.y },
        { x: position.x, y: position.y - 1 },
        { x: position.x, y: position.y + 1 }
      ].filter(pos => pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size);
    };
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
    setAgentPosition({ x, y });

    if (x === wumpusPosition.x && y === wumpusPosition.y) {
      setGameOver(true);
      setShowWumpus(true);
      setShowpit(false);
    } else if (x === pitPosition.x && y === pitPosition.y) {
      setGameOver(true);
      setShowpit(true);
      setShowWumpus(false);
    } else if (x === goldPosition.x && y === goldPosition.y && !hasGold) {
      setHasGold(true);
    } else if (x === 0 && y === 0 && hasGold) {
      setGameSuccess(true);
    }

    // Update agent's board knowledge
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
    console.log("Agent Board:");
    console.table(newAgentBoard);
    console.log("Actual Board:");
    console.table(actualBoard);
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
        <Controls moveUp={moveUp} moveDown={moveDown} moveLeft={moveLeft} moveRight={moveRight} />
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
        <h3>Agent Board</h3>
        <BoardDisplay board={agentBoard} />
        <h3>Actual Board</h3>
        <BoardDisplay board={actualBoard} />
      </div>
    </div>
  );
};

export default App;

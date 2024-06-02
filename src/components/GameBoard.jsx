import React from 'react';
import './GameBoard.css';

const GameBoard = ({ size, agentPosition, goldPosition, hasGold, stenchPositions, breezePositions, wumpusPosition, pitPosition }) => {
  const renderCell = (x, y) => {
    const isAgent = agentPosition.x === x && agentPosition.y === y;
    const isGold = goldPosition.x === x && goldPosition.y === y && !hasGold;
    const isWumpus = wumpusPosition.x === x && wumpusPosition.y === y;
    const isPit = pitPosition.x === x && pitPosition.y === y;
    const isStench = stenchPositions.some(pos => pos.x === x && pos.y === y);
    const isBreeze = breezePositions.some(pos => pos.x === x && pos.y === y);

    return (
      <div
        className={`cell ${isAgent ? 'agent-cell' : ''} ${isStench ? 'stench-cell' : ''} ${isBreeze ? 'breeze-cell' : ''}`}
        key={`${x}-${y}`}
      >
        {isAgent && <div className="agent"></div>}
        {isGold && <div className="gold"></div>}
        {isWumpus && <div className="wumpus"></div>}
        {isPit && <div className="pit"></div>}
      </div>
    );
  };

  return (
    <div id="gameBoard">
      {Array.from({ length: size }).map((_, x) =>
        Array.from({ length: size }).map((_, y) => renderCell(x, y))
      )}
    </div>
  );
};

export default GameBoard;

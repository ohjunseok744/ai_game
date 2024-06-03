import React from 'react';
import './GameBoard.css';

const GameBoard = ({ size, agentPosition, goldPosition, hasGold, stenchPositions, breezePositions, wumpusPosition, pitPosition, wumpusAlive, arrowPosition }) => {
  const renderCell = (x, y) => {
    const isAgent = agentPosition.x === x && agentPosition.y === y;
    const isGold = goldPosition.x === x && goldPosition.y === y && !hasGold;
    const isWumpus = wumpusAlive && wumpusPosition.x === x && wumpusPosition.y === y;
    const isPit = pitPosition.x === x && pitPosition.y === y;
    const isStench = stenchPositions.some(pos => pos.x === x && pos.y === y);
    const isBreeze = breezePositions.some(pos => pos.x === x && pos.y === y);
    const isArrow = arrowPosition && arrowPosition.x === x && arrowPosition.y === y;

    let className = 'cell';
    if (isAgent) className += ' agent-cell';
    if (isGold) className += ' gold-cell';
    if (isWumpus) className += ' wumpus-cell';
    if (isPit) className += ' pit-cell';
    if (isStench) className += ' stench-cell';
    if (isBreeze) className += ' breeze-cell';
    if (isArrow) className += ' arrow-cell';

    return (
      <div className={className} key={`${x}-${y}`}>
        {isAgent && <div className="agent"></div>}
        {isGold && <div className="gold"></div>}
        {isWumpus && <div className="wumpus"></div>}
        {isPit && <div className="pit"></div>}
        {isArrow && <div className="arrow"></div>}
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

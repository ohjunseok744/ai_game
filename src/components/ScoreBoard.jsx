import React from 'react';
import './ScoreBoard.css';

const ScoreBoard = ({ board }) => {
  return (
    <div className="scoreBoard">
      {board.map((row, rowIndex) => (
        <div className="scoreRow" key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <div className="scoreCell" key={cellIndex}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ScoreBoard;

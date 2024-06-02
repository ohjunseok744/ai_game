import React from 'react';
import './BoardDisplay.css';

const BoardDisplay = ({ board }) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="boardRow" key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <div className="boardCell" key={cellIndex}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;

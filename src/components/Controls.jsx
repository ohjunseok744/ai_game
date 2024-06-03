import React from 'react';
import './Controls.css';

const Controls = ({ moveUp, moveDown, moveLeft, moveRight, executeAI }) => {
  return (
    <div className="controls">
      <div className="control-row">
        <button className="key" onClick={moveUp}>↑</button>
      </div>
      <div className="control-row">
        <button className="key" onClick={moveLeft}>←</button>
        <button className="key" onClick={moveDown}>↓</button>
        <button className="key" onClick={moveRight}>→</button>
      </div>
      <button className="aiButton" onClick={executeAI}>AI 실행</button>
    </div>
  );
};

export default Controls;

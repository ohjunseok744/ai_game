import React from 'react';
import './GameOver.css';

const GameOver = ({ gameOver, showWumpus, showpit, gameSuccess, resetGame, startNewGame }) => {
  return (
    <div>
      {gameOver && (
        <div className="gameOver">
          <h2>Game Over</h2>
          <button onClick={resetGame}>다시하기</button>
          <button onClick={startNewGame}>처음부터</button>
          {showWumpus && <div className="wumpusScreen"></div>}
          {showpit && <div className="pitScreen"></div>}
        </div>
      )}
      {gameSuccess && (
        <div className="gameOver">
          <h2>Success!</h2>
          <button onClick={startNewGame}>처음부터</button>
          <div className="successScreen"></div>
        </div>
      )}
    </div>
  );
};

export default GameOver;

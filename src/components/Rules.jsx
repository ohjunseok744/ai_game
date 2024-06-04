import React from 'react';
import './Rules.css';

const Rules = () => (
  <div className="rules">
    <h2>Wumpus Game 규칙</h2>
    <p>금을 가지고 (1, 1) 위치로 돌아오면 게임이 끝납니다.</p>
    <ul>
      <li><strong>Wumpus</strong>: Wumpus가 있는 칸에 들어가면 게임이 끝납니다.</li>
      <li><strong>Pit</strong>: Pit가 있는 칸에 들어가면 게임이 끝납니다.</li>
      <li><strong>Stench</strong>: Wumpus 주변 칸에 나타나는 냄새.</li>
      <li><strong>Breeze</strong>: Pit 주변 칸에 나타나는 바람.</li>
      <li><strong>Arrow</strong>: Wumpus를 죽이기 위해 화살을 쏩니다.</li>
    </ul>
  </div>
);

export default Rules;

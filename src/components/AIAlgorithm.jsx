import React from 'react';

const AIAlgorithm = () => {
  return (
    <div className="aiAlgorithm">
      <h2>AI 알고리즘</h2>
      <p>AI 알고리즘은 각 위치를 다음과 같은 여러 요소를 기반으로 평가합니다:</p>
      <ul>
        <li>
          <strong>금 위치:</strong> 금이 있는 칸은 높은 점수인 100점을 받습니다.
        </li>
        <li>
          <strong>금까지의 거리:</strong> 금에서 한 칸 멀어질 때마다 점수가 2점씩 감소합니다.
        </li>
        <li>
          <strong>악취 (웜푸스 근처):</strong> 웜푸스 인접 칸은 점수가 7점 감소합니다.
        </li>
        <li>
          <strong>바람 (구덩이 근처):</strong> 구덩이 인접 칸은 점수가 7점 감소합니다.
        </li>
        <li>
          <strong>안전한 칸:</strong> 안전하다고 판단된 칸은 점수가 5점 증가합니다.
        </li>
      </ul>
      <p>AI는 점수가 가장 높은 경로를 선택하여 보드를 안전하고 효율적으로 탐색합니다.</p>
    </div>
  );
};

export default AIAlgorithm;

import React from 'react';
import { getScoreColor } from '../../utils/helpers';

const ScoreCircle = ({ score, size = 120, label = 'ATS Score' }) => {
  const color = getScoreColor(score);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-input)" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ marginTop: -size / 2 - 20, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: size * 0.25, fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>{score}%</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
      </div>
      <div style={{ height: size * 0.3 }} />
    </div>
  );
};

export default ScoreCircle;

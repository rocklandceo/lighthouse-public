'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  previousScore?: number;
  icon?: React.ReactNode;
  subtitle?: string;
}

export default function ScoreCard({
  title,
  score,
  previousScore,
  icon,
  subtitle,
}: ScoreCardProps) {
  const change = previousScore !== undefined ? score - previousScore : 0;

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-600';
    if (s >= 70) return 'text-[var(--bronze-500)]';
    return 'text-red-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 90) return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200';
    if (s >= 70) return 'bg-gradient-to-br from-amber-50 to-orange-50 border-[var(--bronze-300)]';
    return 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200';
  };

  const getChangeIcon = () => {
    if (change > 0) return <TrendingUp size={16} className="text-emerald-500" />;
    if (change < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-[var(--warm-300)]" />;
  };

  return (
    <div className={`rounded-xl border p-5 card-hover shadow-sm ${getScoreBg(score)}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-semibold text-[var(--navy-800)]">{title}</span>
        <span className="text-[var(--navy-800)]/40">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-[var(--navy-800)]/40 font-medium">/100</span>
      </div>
      {previousScore !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 text-sm">
          {getChangeIcon()}
          <span className={`font-medium ${
            change > 0 ? 'text-emerald-600' :
            change < 0 ? 'text-red-600' :
            'text-[var(--navy-800)]/50'
          }`}>
            {change > 0 ? '+' : ''}{change} from last scan
          </span>
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-[var(--navy-800)]/50 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

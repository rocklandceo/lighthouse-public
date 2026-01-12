'use client';

import React from 'react';
import ScoreCard from '@/components/ScoreCard';
import { Smartphone, Monitor } from 'lucide-react';

interface LighthouseScores {
  performance: number;
  accessibility: number;
  'best-practices': number;
  seo: number;
}

interface OverviewTabProps {
  scores: {
    mobile?: LighthouseScores;
    desktop?: LighthouseScores;
  } | null;
  summary: string | null;
  healthScore: number | null;
  loading?: boolean;
}

/**
 * Overview tab showing current Lighthouse scores and AI summary.
 * Displays mobile and desktop scores side by side.
 */
export default function OverviewTab({
  scores,
  summary,
  healthScore,
  loading = false,
}: OverviewTabProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No performance data available.</p>
        <p className="text-sm mt-2">Run a Lighthouse scan to see scores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            {healthScore !== null && (
              <div className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  healthScore >= 80 ? 'bg-green-100 text-green-700' :
                  healthScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {healthScore}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-700">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Scores */}
      {scores.mobile && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone size={20} />
            Mobile Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard title="Performance" score={scores.mobile.performance} />
            <ScoreCard title="Accessibility" score={scores.mobile.accessibility} />
            <ScoreCard title="Best Practices" score={scores.mobile['best-practices']} />
            <ScoreCard title="SEO" score={scores.mobile.seo} />
          </div>
        </div>
      )}

      {/* Desktop Scores */}
      {scores.desktop && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Monitor size={20} />
            Desktop Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard title="Performance" score={scores.desktop.performance} />
            <ScoreCard title="Accessibility" score={scores.desktop.accessibility} />
            <ScoreCard title="Best Practices" score={scores.desktop['best-practices']} />
            <ScoreCard title="SEO" score={scores.desktop.seo} />
          </div>
        </div>
      )}
    </div>
  );
}

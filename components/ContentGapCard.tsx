'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Target, TrendingUp, Clock, FileText, Copy, Check, Trophy } from 'lucide-react';

interface ContentGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  topCompetitor: string | null;
  topCompetitorPosition: number | null;
  suggestedAction: string;
  headline?: string;
  rationale?: string;
  outline?: string[];
  targetKeywords?: string[];
  wordCountTarget?: number;
  estimatedReadTime?: string;
  aiWritingPrompt?: string;
}

interface ContentGapCardProps {
  gap: ContentGap;
}

const getDifficultyLabel = (difficulty: number): string => {
  if (difficulty >= 70) return 'Competitive';
  if (difficulty >= 50) return 'Moderate Competition';
  return 'Easy to Rank';
};

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty >= 70) return 'bg-red-100 text-red-700';
  if (difficulty >= 50) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

const getPriorityByVolume = (volume: number): { label: string; color: string } => {
  if (volume >= 1000) return { label: 'High Priority', color: 'bg-red-50 text-red-700 border-red-200' };
  if (volume >= 500) return { label: 'Medium Priority', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  return { label: 'Low Priority', color: 'bg-green-50 text-green-700 border-green-200' };
};

export default function ContentGapCard({ gap }: ContentGapCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const priority = getPriorityByVolume(gap.searchVolume);

  const copyAIPrompt = async () => {
    if (gap.aiWritingPrompt) {
      await navigator.clipboard.writeText(gap.aiWritingPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If no enhanced fields, show simple view
  if (!gap.headline && !gap.outline) {
    return (
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
          <span className="font-semibold text-gray-900">{gap.keyword}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {gap.searchVolume.toLocaleString()} searches/mo
            </span>
            {gap.topCompetitor && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                #{gap.topCompetitorPosition} {gap.topCompetitor}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">{gap.suggestedAction}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 ${priority.color} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-white/50 transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${priority.color}`}>
              {priority.label}
            </span>
            {gap.wordCountTarget && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <FileText size={12} />
                {gap.wordCountTarget.toLocaleString()} words
              </span>
            )}
            {gap.estimatedReadTime && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                {gap.estimatedReadTime}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{gap.headline || gap.keyword}</h3>
          <p className="text-sm text-gray-600 mt-1">{gap.keyword}</p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <TrendingUp size={14} />
              {gap.searchVolume.toLocaleString()}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(gap.difficulty)}`}>
              {getDifficultyLabel(gap.difficulty)}
            </div>
          </div>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 bg-white/50">
          <div className="border-t border-gray-200 pt-4">
            {/* Competitor Info */}
            {gap.topCompetitor && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-orange-50 rounded-lg">
                <Trophy size={16} className="text-orange-600" />
                <span className="text-sm text-orange-800">
                  <strong>{gap.topCompetitor}</strong> currently ranks <strong>#{gap.topCompetitorPosition}</strong> for this keyword
                </span>
              </div>
            )}

            {/* Rationale */}
            {gap.rationale && (
              <p className="text-gray-600 mb-4">{gap.rationale}</p>
            )}

            {/* Target Keywords */}
            {gap.targetKeywords && gap.targetKeywords.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Target size={14} />
                  Target Keywords ({gap.targetKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gap.targetKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Article Outline */}
            {gap.outline && gap.outline.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Suggested Article Outline ({gap.outline.length} sections)
                </h4>
                <ol className="list-decimal list-inside space-y-1">
                  {gap.outline.map((section, idx) => (
                    <li key={idx} className="text-sm text-gray-600">{section}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* AI Writing Prompt */}
            {gap.aiWritingPrompt && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">AI Writing Prompt</h4>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyAIPrompt();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Prompt
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {gap.aiWritingPrompt}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

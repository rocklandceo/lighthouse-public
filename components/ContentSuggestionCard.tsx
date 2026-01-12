'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Target, BarChart2, Clock, FileText, Copy, Check } from 'lucide-react';
import type { ContentSuggestion } from '@/lib/types/insights';

interface ContentSuggestionCardProps {
  suggestion: ContentSuggestion;
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-green-50 text-green-700 border-green-200',
};

const difficultyLabels: Record<string, string> = {
  low: 'Easy to Rank',
  medium: 'Moderate Competition',
  high: 'Competitive',
};

export default function ContentSuggestionCard({ suggestion }: ContentSuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAIPrompt = async () => {
    if (suggestion.aiWritingPrompt) {
      await navigator.clipboard.writeText(suggestion.aiWritingPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${priorityColors[suggestion.priority] || priorityColors.medium} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-white/50 transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${priorityColors[suggestion.priority] || priorityColors.medium}`}>
              {suggestion.priority} priority
            </span>
            {suggestion.wordCountTarget && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <FileText size={12} />
                {suggestion.wordCountTarget.toLocaleString()} words
              </span>
            )}
            {suggestion.estimatedReadTime && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                {suggestion.estimatedReadTime}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{suggestion.topic}</h3>
          <p className="text-sm text-gray-600 mt-1">{suggestion.headline}</p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <BarChart2 size={14} />
              {suggestion.searchVolume}
            </div>
            <div className="text-xs text-gray-500">{difficultyLabels[suggestion.difficulty] || 'Unknown'}</div>
          </div>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 bg-white/50">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 mb-4">{suggestion.rationale}</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Target size={14} />
                Target Keywords ({suggestion.targetKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestion.targetKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Article Outline ({suggestion.outline.length} sections)</h4>
              <ol className="list-decimal list-inside space-y-1">
                {suggestion.outline.map((section, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{section}</li>
                ))}
              </ol>
            </div>

            {suggestion.keyTakeaways && suggestion.keyTakeaways.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Takeaways</h4>
                <ul className="list-disc list-inside space-y-1">
                  {suggestion.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="text-sm text-gray-600">{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {suggestion.callToAction && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested CTA</h4>
                <p className="text-sm text-gray-600 italic">&ldquo;{suggestion.callToAction}&rdquo;</p>
              </div>
            )}

            {suggestion.aiWritingPrompt && (
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
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {suggestion.aiWritingPrompt}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

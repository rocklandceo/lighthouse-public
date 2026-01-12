'use client';

import React from 'react';

interface CopyDiffViewProps {
  currentCopy: string;
  suggestedCopy: string;
}

/**
 * Word-level diff component for copy comparisons
 * Highlights added/removed words between current and suggested copy
 */
export default function CopyDiffView({ currentCopy, suggestedCopy }: CopyDiffViewProps) {
  const currentWords = currentCopy.split(/\s+/);
  const suggestedWords = suggestedCopy.split(/\s+/);

  // Find common words (simple LCS-inspired approach)
  const currentLower = currentWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const suggestedLower = suggestedWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const removedIndices = new Set<number>();
  const addedIndices = new Set<number>();
  const matchedSuggested = new Set<number>();

  // Find words in current that don't exist in suggested
  currentLower.forEach((word, idx) => {
    const suggIdx = suggestedLower.findIndex((w, i) => w === word && !matchedSuggested.has(i));
    if (suggIdx === -1) {
      removedIndices.add(idx);
    } else {
      matchedSuggested.add(suggIdx);
    }
  });

  // Find words in suggested that don't exist in current
  suggestedLower.forEach((word, idx) => {
    if (!matchedSuggested.has(idx)) {
      addedIndices.add(idx);
    }
  });

  return (
    <div className="space-y-3">
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 font-medium mb-1">CHANGES HIGHLIGHTED</div>
        <p className="text-gray-700 leading-relaxed">
          {suggestedWords.map((word, idx) => (
            <span key={idx}>
              {addedIndices.has(idx) ? (
                <span className="bg-green-200 text-green-800 px-0.5 rounded">{word}</span>
              ) : (
                <span>{word}</span>
              )}
              {idx < suggestedWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="text-xs text-red-600 font-medium mb-1">CURRENT</div>
          <p className="text-gray-700 text-sm">
            {currentWords.map((word, idx) => (
              <span key={idx}>
                {removedIndices.has(idx) ? (
                  <span className="line-through text-red-500">{word}</span>
                ) : (
                  <span>{word}</span>
                )}
                {idx < currentWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="text-xs text-green-600 font-medium mb-1">SUGGESTED</div>
          <p className="text-gray-700 text-sm">
            {suggestedWords.map((word, idx) => (
              <span key={idx}>
                {addedIndices.has(idx) ? (
                  <span className="font-medium text-green-700">{word}</span>
                ) : (
                  <span>{word}</span>
                )}
                {idx < suggestedWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, RotateCcw, Archive } from 'lucide-react';

interface CompletedItem {
  id: string;
  completedAt: string;
}

interface CompletedActionsArchiveProps {
  completedItems: CompletedItem[];
  onRestore: (id: string) => void;
  /** Map of item IDs to their display titles */
  itemTitles?: Record<string, string>;
}

/**
 * Collapsible archive section showing completed action items.
 * Displays completion dates and allows restoring items.
 */
export default function CompletedActionsArchive({
  completedItems,
  onRestore,
  itemTitles = {},
}: CompletedActionsArchiveProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (completedItems.length === 0) {
    return null;
  }

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get display title for an item
  const getDisplayTitle = (id: string): string => {
    if (itemTitles[id]) {
      return itemTitles[id];
    }
    // Parse title from ID (format: type-title-slug-index)
    const parts = id.split('-');
    if (parts.length >= 2) {
      // Remove type prefix and index suffix, join remaining parts
      const titleParts = parts.slice(1, -1);
      return titleParts
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return id;
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 mt-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Archive size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Completed Items
          </span>
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            {completedItems.length}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-100">
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 rounded">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <div>
                    <span className="text-sm text-gray-700 line-through decoration-gray-400">
                      {getDisplayTitle(item.id)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatRelativeTime(item.completedAt)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(item.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  title="Restore this item"
                >
                  <RotateCcw size={12} />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-gray-100 text-xs text-gray-500 border-t border-gray-200">
            Completed items are kept for 30 days
          </div>
        </div>
      )}
    </div>
  );
}

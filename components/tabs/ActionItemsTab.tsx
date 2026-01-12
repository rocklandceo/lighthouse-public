'use client';

import React from 'react';
import ActionItemCard from '@/components/ActionItemCard';
import CompletedActionsArchive from '@/components/CompletedActionsArchive';
import { Zap, CheckCircle } from 'lucide-react';
import type { ActionItem } from '@/lib/types/insights';

interface CompletedItem {
  id: string;
  completedAt: string;
}

interface ActionItemsTabProps {
  actionItems: ActionItem[];
  completedItems: CompletedItem[];
  onToggleComplete: (id: string, completed: boolean) => void;
  loading?: boolean;
}

/**
 * Action Items tab showing quick wins and completed items archive.
 * Supports completion tracking with persistence via API.
 */
export default function ActionItemsTab({
  actionItems,
  completedItems,
  onToggleComplete,
  loading = false,
}: ActionItemsTabProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  // Build a map of item IDs to titles for the archive
  const itemTitles: Record<string, string> = {};
  actionItems.forEach((item, idx) => {
    const itemId = `${item.type}-${item.title.toLowerCase().replace(/\s+/g, '-')}-${idx}`;
    itemTitles[itemId] = item.title;
  });

  // Get completed item IDs set
  const completedIds = new Set(completedItems.map(item => item.id));

  // Split items into active and completed
  const activeItems = actionItems.filter((item, idx) => {
    const itemId = `${item.type}-${item.title.toLowerCase().replace(/\s+/g, '-')}-${idx}`;
    return !completedIds.has(itemId);
  });

  const completedCount = completedItems.length;
  const totalCount = actionItems.length;

  const handleRestore = (id: string) => {
    onToggleComplete(id, false);
  };

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          Quick Wins
        </h3>
        {totalCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500" />
            <span>
              {completedCount} of {totalCount} completed
            </span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Items */}
      {activeItems.length === 0 && completedCount === totalCount && totalCount > 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h4 className="text-lg font-medium text-green-800">All items completed!</h4>
          <p className="text-sm text-green-600 mt-1">
            Great job! You&apos;ve completed all quick wins.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actionItems.map((item, idx) => {
            const itemId = `${item.type}-${item.title.toLowerCase().replace(/\s+/g, '-')}-${idx}`;
            const isCompleted = completedIds.has(itemId);
            return (
              <ActionItemCard
                key={idx}
                item={item}
                index={idx}
                isCompleted={isCompleted}
                onToggleComplete={onToggleComplete}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {actionItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No action items available.</p>
          <p className="text-sm mt-2">Generate AI insights to see quick wins.</p>
        </div>
      )}

      {/* Completed Items Archive */}
      <CompletedActionsArchive
        completedItems={completedItems}
        onRestore={handleRestore}
        itemTitles={itemTitles}
      />
    </div>
  );
}

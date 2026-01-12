'use client';

import React from 'react';
import { ChevronDown, Globe, FileText } from 'lucide-react';

interface PageSelectorProps {
  pages: { path: string; url: string }[];
  selectedPage: string | null;
  onSelectPage: (path: string | null) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Dropdown selector for choosing a specific page for AI analysis.
 * Used in Schema and Copy sections to get page-specific recommendations.
 */
export default function PageSelector({
  pages,
  selectedPage,
  onSelectPage,
  label = 'Select a page for specific recommendations',
  disabled = false,
}: PageSelectorProps) {
  // Get display name for a path
  const getDisplayName = (path: string): string => {
    if (path === '/' || path === '') return 'Homepage';
    // Remove leading slash and format
    const clean = path.replace(/^\//, '').replace(/\/$/, '');
    return clean
      .split('/')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ');
  };

  const selectId = React.useId();

  return (
    <div className="relative">
      <label htmlFor={selectId} className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <select
          id={selectId}
          value={selectedPage || ''}
          onChange={(e) => onSelectPage(e.target.value || null)}
          disabled={disabled}
          className={`
            appearance-none w-full pl-9 pr-10 py-2
            border border-gray-200 rounded-lg
            text-sm text-gray-700
            bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            cursor-pointer
          `}
        >
          <option value="">All pages (site-wide)</option>
          {pages.map((page) => (
            <option key={page.path} value={page.path}>
              {getDisplayName(page.path)}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {selectedPage ? (
            <FileText size={16} className="text-blue-500" />
          ) : (
            <Globe size={16} className="text-gray-400" />
          )}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
      {selectedPage && (
        <p className="text-xs text-blue-600 mt-1">
          Recommendations will be tailored for: {getDisplayName(selectedPage)}
        </p>
      )}
    </div>
  );
}

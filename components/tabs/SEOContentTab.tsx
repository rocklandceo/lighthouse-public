'use client';

import React, { useState } from 'react';
import ContentSuggestionCard from '@/components/ContentSuggestionCard';
import CopyDiffView from '@/components/CopyDiffView';
import PageSelector from '@/components/PageSelector';
import { Copy, Check, Code, FileText, Search, Layers } from 'lucide-react';
import type { ContentSuggestion, SchemaSuggestion, CopyImprovement } from '@/lib/types/insights';

interface SEOContentTabProps {
  contentSuggestions: ContentSuggestion[];
  schemaSuggestions: SchemaSuggestion[];
  copyImprovements: CopyImprovement[];
  availablePages: { path: string; url: string }[];
  onRefresh?: (page?: string) => void;
  loading?: boolean;
}

/**
 * SEO Content tab showing content suggestions, schema markup, and copy improvements.
 * Supports page-specific filtering for targeted recommendations.
 */
export default function SEOContentTab({
  contentSuggestions,
  schemaSuggestions,
  copyImprovements,
  availablePages,
  onRefresh,
  loading = false,
}: SEOContentTabProps) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'content' | 'schema' | 'copy'>('content');

  const copySchemaToClipboard = async (schema: string, index: number) => {
    await navigator.clipboard.writeText(schema);
    setCopiedSchema(index);
    setTimeout(() => setCopiedSchema(null), 2000);
  };

  const handlePageChange = (path: string | null) => {
    setSelectedPage(path);
    onRefresh?.(path || undefined);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  const sections = [
    { id: 'content', label: 'Content Ideas', icon: FileText, count: contentSuggestions.length },
    { id: 'schema', label: 'Schema Markup', icon: Layers, count: schemaSuggestions.length },
    { id: 'copy', label: 'Copy Improvements', icon: Search, count: copyImprovements.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <PageSelector
        pages={availablePages}
        selectedPage={selectedPage}
        onSelectPage={handlePageChange}
        label="Filter recommendations by page"
      />

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {sections.map(({ id, label, icon: Icon, count }) => (
          <button
            type="button"
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeSection === id
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} />
            {label}
            {count > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Suggestions */}
      {activeSection === 'content' && (
        <div className="space-y-4">
          {contentSuggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No content suggestions available. Generate AI insights to see recommendations.
            </p>
          ) : (
            contentSuggestions.map((suggestion, idx) => (
              <ContentSuggestionCard key={idx} suggestion={suggestion} />
            ))
          )}
        </div>
      )}

      {/* Schema Suggestions */}
      {activeSection === 'schema' && (
        <div className="space-y-4">
          {schemaSuggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No schema suggestions available.
            </p>
          ) : (
            schemaSuggestions.map((schema, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <Code size={12} />
                      {schema.type}
                    </span>
                    <h4 className="font-medium text-gray-900 mt-2">{schema.description}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => copySchemaToClipboard(schema.jsonLd, idx)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  >
                    {copiedSchema === idx ? <Check size={14} /> : <Copy size={14} />}
                    {copiedSchema === idx ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{schema.jsonLd}</code>
                </pre>
                <p className="text-sm text-gray-600 mt-3">{schema.implementationNotes}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Copy Improvements */}
      {activeSection === 'copy' && (
        <div className="space-y-4">
          {copyImprovements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No copy improvements available.
            </p>
          ) : (
            copyImprovements.map((improvement, idx) => (
              <CopyDiffView
                key={idx}
                currentCopy={improvement.currentCopy}
                suggestedCopy={improvement.suggestedCopy}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

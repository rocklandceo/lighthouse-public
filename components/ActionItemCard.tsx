'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
  Layers,
  Wrench,
  Copy,
  Check,
  Clock,
  Zap,
  Shield,
  Eye,
  Search,
  ArrowRight,
} from 'lucide-react';

interface ActionItem {
  type: 'code' | 'content' | 'schema' | 'technical' | 'copy';
  title: string;
  description: string;
  implementation?: string;
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number;
  // Enhanced fields
  category?: 'performance' | 'seo' | 'accessibility' | 'security' | 'ux' | 'content';
  pageUrl?: string;
  codeSnippet?: string;
  beforeAfter?: { before: string; after: string };
  timeToImplement?: string;
  tools?: string[];
}

interface ActionItemCardProps {
  item: ActionItem;
  index: number;
  isCompleted?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  code: <Code size={16} />,
  content: <FileText size={16} />,
  schema: <Layers size={16} />,
  technical: <Wrench size={16} />,
  copy: <FileText size={16} />,
};

const typeColors: Record<string, string> = {
  code: 'bg-purple-100 text-purple-700',
  content: 'bg-blue-100 text-blue-700',
  schema: 'bg-green-100 text-green-700',
  technical: 'bg-orange-100 text-orange-700',
  copy: 'bg-pink-100 text-pink-700',
};

const effortColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const categoryColors: Record<string, { bg: string; icon: React.ReactNode }> = {
  performance: { bg: 'bg-amber-100 text-amber-700', icon: <Zap size={12} /> },
  seo: { bg: 'bg-blue-100 text-blue-700', icon: <Search size={12} /> },
  accessibility: { bg: 'bg-purple-100 text-purple-700', icon: <Eye size={12} /> },
  security: { bg: 'bg-red-100 text-red-700', icon: <Shield size={12} /> },
  ux: { bg: 'bg-teal-100 text-teal-700', icon: <Eye size={12} /> },
  content: { bg: 'bg-indigo-100 text-indigo-700', icon: <FileText size={12} /> },
};

export default function ActionItemCard({ item, index, isCompleted, onToggleComplete }: ActionItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate unique ID for this item
  const itemId = `${item.type}-${item.title.toLowerCase().replace(/\s+/g, '-')}-${index}`;

  return (
    <div className={`bg-white rounded-lg border overflow-hidden transition-all ${
      isCompleted
        ? 'border-green-200 bg-green-50/50 opacity-75'
        : 'border-gray-200'
    }`}>
      <div className="flex items-center">
        {onToggleComplete && (
          <div className="pl-4 pr-2 py-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(itemId, !isCompleted);
              }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white scale-110'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted && <Check size={12} strokeWidth={3} />}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex-1 px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${onToggleComplete ? 'pl-2' : ''}`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium transition-colors ${
              isCompleted
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isCompleted ? <Check size={14} /> : index + 1}
            </span>
            {item.category && categoryColors[item.category] && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                isCompleted ? 'opacity-60' : ''
              } ${categoryColors[item.category].bg}`}>
                {categoryColors[item.category].icon}
                {item.category}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
              isCompleted ? 'opacity-60' : ''
            } ${typeColors[item.type] || typeColors.technical}`}>
              {typeIcons[item.type] || typeIcons.technical}
              {item.type}
            </span>
            <span className={`font-medium transition-all ${
              isCompleted
                ? 'text-gray-500 line-through decoration-green-500 decoration-2'
                : 'text-gray-900'
            }`}>
              {item.title}
            </span>
            {isCompleted && (
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded">
                Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {item.timeToImplement && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                {item.timeToImplement}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium ${effortColors[item.effort] || effortColors.medium}`}>
              {item.effort} effort
            </span>
            <span className="text-sm text-gray-500 hidden sm:inline">{item.estimatedImpact}</span>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Page URL */}
          {item.pageUrl && (
            <div className="text-sm text-blue-600 mt-3 font-mono">
              {item.pageUrl}
            </div>
          )}

          <p className="text-gray-600 mt-3 mb-4">{item.description}</p>

          {/* Expected Impact - shown on mobile since hidden in header */}
          <p className="text-sm text-gray-500 mb-4 sm:hidden">
            <strong>Impact:</strong> {item.estimatedImpact}
          </p>

          {/* Tools */}
          {item.tools && item.tools.length > 0 && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
              <div className="inline-flex flex-wrap gap-1">
                {item.tools.map((tool, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Before/After comparison */}
          {item.beforeAfter && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 block mb-2">Before → After</span>
              <div className="flex flex-col sm:flex-row gap-2 text-sm">
                <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
                  <span className="text-red-600 line-through">{item.beforeAfter.before}</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 self-center hidden sm:block" />
                <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-700">{item.beforeAfter.after}</span>
                </div>
              </div>
            </div>
          )}

          {/* Code Snippet */}
          {item.codeSnippet && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Code Snippet</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.codeSnippet!)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                <code>{item.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Implementation steps */}
          {item.implementation && (
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Implementation Steps</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.implementation!)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                <code>{item.implementation}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

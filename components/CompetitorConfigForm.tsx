'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Save, RefreshCw } from 'lucide-react';

interface CompetitorConfig {
  competitors: string[];
  keywords: string[];
  lastUpdated: string;
}

interface CompetitorConfigFormProps {
  onConfigSaved?: () => void;
}

export default function CompetitorConfigForm({ onConfigSaved }: CompetitorConfigFormProps) {
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/competitors/config');
      if (res.ok) {
        const data: CompetitorConfig = await res.json();
        setCompetitors(data.competitors);
        setKeywords(data.keywords);
        setLastUpdated(data.lastUpdated);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/competitors/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors, keywords }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastUpdated(data.config.lastUpdated);
        onConfigSaved?.();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save configuration');
      }
    } catch (_err) {
      setError('Network error - failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addCompetitor = () => {
    if (competitors.length < 10) {
      setCompetitors([...competitors, '']);
    }
  };

  const updateCompetitor = (idx: number, value: string) => {
    const updated = [...competitors];
    updated[idx] = value;
    setCompetitors(updated);
  };

  const removeCompetitor = (idx: number) => {
    setCompetitors(competitors.filter((_, i) => i !== idx));
  };

  const addKeyword = () => {
    if (keywords.length < 20) {
      setKeywords([...keywords, '']);
    }
  };

  const updateKeyword = (idx: number, value: string) => {
    const updated = [...keywords];
    updated[idx] = value;
    setKeywords(updated);
  };

  const removeKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
        title="Click to configure competitors and keywords"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
            {isExpanded ? 'Hide Configuration' : 'Edit Configuration'}
          </span>
          <ChevronDown
            size={18}
            className={`text-blue-600 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
        <span className="text-sm text-gray-500">
          {competitors.length} competitor{competitors.length !== 1 ? 's' : ''}, {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} configured
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Competitors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Competitor Domains ({competitors.length}/10)
              </label>
              {competitors.length < 10 && (
                <button
                  type="button"
                  onClick={addCompetitor}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={14} />
                  Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {competitors.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => updateCompetitor(idx, e.target.value)}
                    placeholder="example.com"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeCompetitor(idx)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    aria-label={`Remove competitor ${comp || 'entry'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {competitors.length === 0 && (
                <p className="text-sm text-gray-500 italic">No competitors configured</p>
              )}
            </div>
          </div>

          {/* Keywords Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Target Keywords ({keywords.length}/20)
              </label>
              {keywords.length < 20 && (
                <button
                  type="button"
                  onClick={addKeyword}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={14} />
                  Add
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {keywords.map((kw, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={kw}
                    onChange={(e) => updateKeyword(idx, e.target.value)}
                    placeholder="legal time tracking"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyword(idx)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    aria-label={`Remove keyword ${kw || 'entry'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {keywords.length === 0 && (
                <p className="text-sm text-gray-500 italic col-span-2">No keywords configured</p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
            <button
              type="button"
              onClick={saveConfig}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

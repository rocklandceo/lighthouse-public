'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  Search,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { getBranding } from '@/lib/branding';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
  { id: 'performance', label: 'Performance', icon: <TrendingUp size={18} /> },
  { id: 'seo', label: 'SEO & Content', icon: <Search size={18} /> },
  { id: 'competitors', label: 'Competitors', icon: <Users size={18} /> },
  { id: 'actions', label: 'Action Items', icon: <FileText size={18} /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  lastScan?: string;
  healthScore?: number;
}

export default function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  lastScan,
  healthScore,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const branding = getBranding();

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-20 shadow-lg" style={{ background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary) 100%)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Mobile: Compact title + Health badge */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Image
                src={branding.logoPath}
                alt={branding.name}
                width={32}
                height={32}
                className="shrink-0"
              />
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                {branding.name}
              </h1>
              {healthScore !== undefined && (
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm shrink-0 ${
                  healthScore >= 80 ? 'bg-emerald-400 text-emerald-950' :
                  healthScore >= 60 ? 'bg-amber-400 text-amber-900' :
                  'bg-red-400 text-red-950'
                }`}>
                  {healthScore}%
                </span>
              )}
            </div>
            {/* Desktop: Full header info */}
            <div className="hidden sm:flex items-center gap-6">
              {lastScan && (
                <span className="text-sm text-white/80 flex items-center gap-1.5">
                  <Clock size={14} />
                  Last scan: {new Date(lastScan).toLocaleDateString()}
                </span>
              )}
            </div>
            {/* Mobile: Menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-white/90 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-10 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-white shadow-xl border-b border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Navigation Tabs */}
            <div className="p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Mobile Meta Info */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              {lastScan && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock size={12} />
                  Last scan: {new Date(lastScan).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation - Desktop horizontal, Mobile shows current tab */}
      <nav className="bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Horizontal tabs */}
          <div className="hidden sm:flex space-x-1 overflow-x-auto py-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          {/* Mobile: Current tab indicator */}
          <div className="sm:hidden py-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                {activeTabData?.icon}
                {activeTabData?.label}
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            {branding.name} &bull; Powered by Lighthouse &amp; AI
          </p>
        </div>
      </footer>
    </div>
  );
}

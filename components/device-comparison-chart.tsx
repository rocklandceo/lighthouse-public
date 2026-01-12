'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { LighthouseScore } from '@/lib/reports';

interface ComparisonData {
  metric: string;
  mobile: number;
  desktop: number;
}

interface DeviceComparisonChartProps {
  mobileScores: LighthouseScore;
  desktopScores: LighthouseScore;
}

export function DeviceComparisonChart({ mobileScores, desktopScores }: DeviceComparisonChartProps) {
  const data: ComparisonData[] = [
    {
      metric: 'Performance',
      mobile: mobileScores.performance,
      desktop: desktopScores.performance
    },
    {
      metric: 'Accessibility',
      mobile: mobileScores.accessibility,
      desktop: desktopScores.accessibility
    },
    {
      metric: 'Best Practices',
      mobile: mobileScores['best-practices'],
      desktop: desktopScores['best-practices']
    },
    {
      metric: 'SEO',
      mobile: mobileScores.seo,
      desktop: desktopScores.seo
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
        Mobile vs Desktop Comparison
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="metric"
            className="text-xs text-zinc-600 dark:text-zinc-400"
          />
          <YAxis
            domain={[0, 100]}
            className="text-xs text-zinc-600 dark:text-zinc-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Bar
            dataKey="mobile"
            fill="#3b82f6"
            name="Mobile"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="desktop"
            fill="#10b981"
            name="Desktop"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

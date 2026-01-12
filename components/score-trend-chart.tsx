'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface TrendDataPoint {
  date: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface ScoreTrendChartProps {
  data: TrendDataPoint[];
  device: string;
}

export function ScoreTrendChart({ data, device }: ScoreTrendChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
        {device} Score Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="performance"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Performance"
            dot={{ fill: '#3b82f6' }}
          />
          <Line
            type="monotone"
            dataKey="accessibility"
            stroke="#10b981"
            strokeWidth={2}
            name="Accessibility"
            dot={{ fill: '#10b981' }}
          />
          <Line
            type="monotone"
            dataKey="bestPractices"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Best Practices"
            dot={{ fill: '#f59e0b' }}
          />
          <Line
            type="monotone"
            dataKey="seo"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="SEO"
            dot={{ fill: '#8b5cf6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

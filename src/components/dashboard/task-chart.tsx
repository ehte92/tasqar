'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer } from '../ui/chart';

const data = [
  { name: 'Mon', total: 4 },
  { name: 'Tue', total: 3 },
  { name: 'Wed', total: 2 },
  { name: 'Thu', total: 6 },
  { name: 'Fri', total: 5 },
  { name: 'Sat', total: 1 },
  { name: 'Sun', total: 3 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb',
  },
  mobile: {
    label: 'Mobile',
    color: '#60a5fa',
  },
} satisfies ChartConfig;

export function TaskChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Task Completion</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px]">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={data}>
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

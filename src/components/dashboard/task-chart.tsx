'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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
  total: {
    label: 'Total',
    color: '#2563eb',
  },
} satisfies ChartConfig;

export function TaskChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Task Completion</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

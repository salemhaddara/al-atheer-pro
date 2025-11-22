'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, Direction } from '@/lib/translations';

interface CompanyPerformanceChartProps {
  data: Array<{ company: string; revenue: number; growth: number }>;
  language: Language;
  direction: Direction;
  revenueLabel: string;
}

export function CompanyPerformanceChart({ data, language, direction, revenueLabel }: CompanyPerformanceChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full" dir="ltr">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="company" type="category" width={150} orientation={direction === 'rtl' ? 'right' : 'left'} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelStyle={{ direction: direction }}
          />
          <Legend wrapperStyle={{ direction: direction, textAlign: direction === 'rtl' ? 'right' : 'left' }} />
          <Bar dataKey="revenue" fill="#8b5cf6" name={revenueLabel} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


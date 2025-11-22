'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, Direction } from '@/lib/translations';

interface SalesChartProps {
  data: Array<{ month: string; sales: number; purchases: number; profit: number }>;
  language: Language;
  direction: Direction;
  translations: {
    sales: string;
    purchases: string;
    profit: string;
  };
}

export function SalesChart({ data, language, direction, translations }: SalesChartProps) {
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
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" reversed={direction === 'rtl'} />
          <YAxis orientation={direction === 'rtl' ? 'right' : 'left'} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelStyle={{ direction: direction }}
          />
          <Legend wrapperStyle={{ direction: direction, textAlign: direction === 'rtl' ? 'right' : 'left' }} />
          <Area type="monotone" dataKey="sales" stackId="1" stroke="#3b82f6" fill="#93c5fd" name={translations.sales} />
          <Area type="monotone" dataKey="purchases" stackId="2" stroke="#f59e0b" fill="#fcd34d" name={translations.purchases} />
          <Area type="monotone" dataKey="profit" stackId="3" stroke="#10b981" fill="#6ee7b7" name={translations.profit} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


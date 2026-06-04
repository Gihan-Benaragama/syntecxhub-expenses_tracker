import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Helper: get YYYY-MM-DD string in local timezone (avoids UTC offset issues)
const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#00B4D8', '#22D3EE', '#38BDF8', '#7DD3FC'];

const IncomeChart = ({ incomes }) => {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build 7 day buckets: today and the 6 days before
    const buckets = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toLocalDateKey(d);
      buckets[key] = { dateKey: key, amount: 0 };
    }

    // Aggregate incomes into matching buckets
    (incomes || []).forEach((inc) => {
      if (!inc.date) return;
      // inc.date is stored as "YYYY-MM-DD" string from the date input
      const key = inc.date.split('T')[0]; // handles both "2026-06-04" and ISO strings
      if (buckets[key]) {
        buckets[key].amount += inc.amount;
      }
    });

    // Format for chart display
    return Object.values(buckets).map((item) => ({
      name: new Date(item.dateKey + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      amount: item.amount,
    }));
  }, [incomes]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0B132B',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            color: '#e2e8f0',
            fontSize: '13px',
          }}
          formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Income']}
        />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeChart;

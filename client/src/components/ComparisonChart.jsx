import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

// Utility to format date key (YYYY-MM-DD) in local timezone
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * ComparisonChart displays expenses and incomes on the same time axis.
 * It aggregates data by day for the last 7 days (including today).
 * Props:
 *   - expenses: array of { amount, date }
 *   - incomes: array of { amount, date }
 */
const ComparisonChart = ({ expenses = [], incomes = [] }) => {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Build buckets for the last 7 days
    const buckets = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d);
      buckets[key] = { name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), expense: 0, income: 0 };
    }

    // Aggregate expenses
    (expenses || []).forEach((exp) => {
      if (!exp.date) return;
      const key = toDateKey(new Date(exp.date));
      if (buckets[key]) {
        buckets[key].expense += exp.amount;
      }
    });
    // Aggregate incomes
    (incomes || []).forEach((inc) => {
      if (!inc.date) return;
      const key = toDateKey(new Date(inc.date));
      if (buckets[key]) {
        buckets[key].income += inc.amount;
      }
    });
    return Object.values(buckets);
  }, [expenses, incomes]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `Rs. ${v / 1000}k`} />
        <Tooltip
          formatter={(value) => `Rs. ${value.toLocaleString()}`}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;

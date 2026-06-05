import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

/**
 * DailyComparisonChart displays side‑by‑side bars for income and expenses per day.
 * Props:
 *   - expenses: array of expense objects with { amount, date }
 *   - incomes:  array of income objects with { amount, date }
 */
const DailyComparisonChart = ({ expenses = [], incomes = [] }) => {
  // Aggregate totals per day for both incomes and expenses
  const data = useMemo(() => {
    const dayMap = {};
    // Helper to add amount to map
    const addToMap = (dateStr, type, amount) => {
      if (!dayMap[dateStr]) dayMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
      dayMap[dateStr][type] += amount;
    };
    // Process expenses
    expenses.forEach((exp) => {
      if (!exp.date) return;
      const d = new Date(exp.date);
      if (isNaN(d)) return;
      const key = d.toISOString().split('T')[0];
      addToMap(key, 'expense', Number(exp.amount) || 0);
    });
    // Process incomes
    incomes.forEach((inc) => {
      if (!inc.date) return;
      const d = new Date(inc.date);
      if (isNaN(d)) return;
      const key = d.toISOString().split('T')[0];
      addToMap(key, 'income', Number(inc.amount) || 0);
    });
    // Convert map to sorted array
    return Object.values(dayMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses, incomes]);

  const maxVal = useMemo(() => {
    let m = 0;
    data.forEach(d => {
      m = Math.max(m, d.income, d.expense);
    });
    return m;
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Income vs Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
          <YAxis domain={[0, (dataMax) => Math.max(dataMax, 0)]} tickFormatter={(v) => v < 1000 ? `${v}` : `Rs. ${v / 1000}k`} allowDataOverflow={true} />
          <Tooltip
            formatter={(value, name) => [`Rs. ${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#10B981" />
          <Bar dataKey="expense" name="Expense" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyComparisonChart;

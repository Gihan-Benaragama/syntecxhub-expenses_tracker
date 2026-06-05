import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

/**
 * CumulativeChart displays three running totals over time:
 *   • Cumulative Income
 *   • Cumulative Expenses
 *   • Net Balance (Income - Expenses)
 *
 * Props:
 *   - expenses: [{ amount, date }]
 *   - incomes:  [{ amount, date }]
 */
const CumulativeChart = ({ expenses = [], incomes = [] }) => {
  // Aggregate daily totals first
  const dailyData = useMemo(() => {
    const dayMap = {};
    const addToMap = (dateStr, type, amount) => {
      if (!dayMap[dateStr]) dayMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
      dayMap[dateStr][type] += amount;
    };
    // Expenses
    expenses.forEach((exp) => {
      if (!exp.date) return;
      const d = new Date(exp.date);
      if (isNaN(d)) return;
      const key = d.toISOString().split('T')[0];
      addToMap(key, 'expense', Number(exp.amount) || 0);
    });
    // Incomes
    incomes.forEach((inc) => {
      if (!inc.date) return;
      const d = new Date(inc.date);
      if (isNaN(d)) return;
      const key = d.toISOString().split('T')[0];
      addToMap(key, 'income', Number(inc.amount) || 0);
    });
    // Sort by date
    return Object.values(dayMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses, incomes]);

  // Build cumulative series
  const cumData = useMemo(() => {
    let cumIncome = 0;
    let cumExpense = 0;
    return dailyData.map((d) => {
      cumIncome += d.income;
      cumExpense += d.expense;
      return {
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        cumulativeIncome: cumIncome,
        cumulativeExpense: cumExpense,
        netBalance: cumIncome - cumExpense,
      };
    });
  }, [dailyData]);

  // Determine Y-axis max
  const maxVal = useMemo(() => {
    let max = 0;
    cumData.forEach((d) => {
      max = Math.max(max, d.cumulativeIncome, d.cumulativeExpense, d.netBalance);
    });
    return max;
  }, [cumData]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Cumulative Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={cumData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis domain={[0, Math.max(maxVal, 1)]} tickFormatter={(v) => v < 1000 ? `${v}` : `Rs. ${v / 1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} labelFormatter={(label) => label} />
          <Legend />
          <Line type="monotone" dataKey="cumulativeIncome" name="Cumulative Income" stroke="#10B981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cumulativeExpense" name="Cumulative Expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="netBalance" name="Net Balance" stroke="#6366F1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CumulativeChart;

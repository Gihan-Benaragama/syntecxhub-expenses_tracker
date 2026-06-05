import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

/**
 * CategorySpendingChart shows expenses per category compared to total income.
 * Props:
 *   - expenses: array of expense objects with { amount, category }
 *   - totalIncome: number representing total income
 */
const CategorySpendingChart = ({ expenses = [], totalIncome = 0 }) => {
  // Aggregate expenses by category
  const data = useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      const cat = exp.category || 'Uncategorized';
      const amt = Number(exp.amount) || 0;
      if (!map[cat]) map[cat] = { category: cat, expense: 0 };
      map[cat].expense += amt;
    });
    return Object.values(map).map((d) => ({
      category: d.category,
      expense: d.expense,
      // percentage of total income, safe division
      percentOfIncome: totalIncome ? (d.expense / totalIncome) * 100 : 0,
    }));
  }, [expenses, totalIncome]);

  // Determine max for Y axis
  const maxVal = useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      if (d.expense > max) max = d.expense;
    });
    return max;
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Spending Breakdown by Category</h2>
      {data.length === 0 ? (
        <p className="text-center text-gray-500">No expense data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="category" />
            <YAxis domain={[0, Math.max(maxVal, 1)]} tickFormatter={(v) => `Rs. ${v / 1000}k`} />
            <Tooltip
              formatter={(value, name, props) => {
                if (name === 'expense') return [`Rs. ${value.toLocaleString()}`, 'Expense'];
                if (name === 'percentOfIncome') return [`${value.toFixed(1)}% of Income`, 'Share'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="expense" name="Expense" fill="#EF4444" />
            <Bar dataKey="percentOfIncome" name="% of Income" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategorySpendingChart;

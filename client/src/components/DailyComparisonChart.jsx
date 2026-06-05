import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

/**
 * DailyComparisonChart displays side‑by‑side bars for income and expenses per day.
 * Props:
 *   - expenses: array of expense objects with { amount, date }
 *   - incomes:  array of income objects with { amount, date }
 */
const DailyComparisonChart = ({ expenses = [], incomes = [], timeRange }) => {
  // Aggregate totals per day/week/month for both incomes and expenses
  const data = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (timeRange === 'This Week') {
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(todayStart);
      monday.setDate(todayStart.getDate() - diffToMonday);

      const dataMap = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = d.toISOString().split('T')[0];
        dataMap[key] = { 
          name: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
          rawDate: d,
          income: 0,
          expense: 0
        };
      }

      expenses.forEach(exp => {
        if (!exp.date) return;
        const d = new Date(exp.date);
        const key = d.toISOString().split('T')[0];
        if (key in dataMap) {
          dataMap[key].expense += Number(exp.amount) || 0;
        }
      });

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        const key = d.toISOString().split('T')[0];
        if (key in dataMap) {
          dataMap[key].income += Number(inc.amount) || 0;
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    if (timeRange === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const daysInMonth = endOfMonth.getDate();

      const dataMap = {};
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), i);
        const key = d.toISOString().split('T')[0];
        dataMap[key] = {
          name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          rawDate: d,
          income: 0,
          expense: 0
        };
      }

      expenses.forEach(exp => {
        if (!exp.date) return;
        const d = new Date(exp.date);
        const key = d.toISOString().split('T')[0];
        if (key in dataMap) {
          dataMap[key].expense += Number(exp.amount) || 0;
        }
      });

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        const key = d.toISOString().split('T')[0];
        if (key in dataMap) {
          dataMap[key].income += Number(inc.amount) || 0;
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    if (timeRange === 'Last 3 Months' || timeRange === 'Last 6 Months') {
      const monthsToSubtract = timeRange === 'Last 3 Months' ? 3 : 6;
      const start = new Date(todayStart);
      start.setMonth(now.getMonth() - monthsToSubtract);
      const startDay = start.getDay();
      const diffToMonday = (startDay + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);

      const dataMap = {};
      let currentWeekStart = new Date(start);
      while (currentWeekStart <= now) {
        const key = currentWeekStart.toISOString().split('T')[0];
        const endOfWeek = new Date(currentWeekStart);
        endOfWeek.setDate(currentWeekStart.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        dataMap[key] = {
          name: `W/C ${currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
          rawDate: new Date(currentWeekStart),
          endOfWeek: endOfWeek,
          income: 0,
          expense: 0
        };
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      expenses.forEach(exp => {
        if (!exp.date) return;
        const d = new Date(exp.date);
        for (const startStr in dataMap) {
          const bucket = dataMap[startStr];
          if (d >= bucket.rawDate && d <= bucket.endOfWeek) {
            bucket.expense += Number(exp.amount) || 0;
            break;
          }
        }
      });

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        for (const startStr in dataMap) {
          const bucket = dataMap[startStr];
          if (d >= bucket.rawDate && d <= bucket.endOfWeek) {
            bucket.income += Number(inc.amount) || 0;
            break;
          }
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    if (timeRange === 'This Year') {
      const dataMap = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        dataMap[i] = {
          name: d.toLocaleDateString(undefined, { month: 'short' }),
          rawDate: d,
          income: 0,
          expense: 0
        };
      }

      expenses.forEach(exp => {
        if (!exp.date) return;
        const d = new Date(exp.date);
        if (d.getFullYear() === now.getFullYear()) {
          const monthIndex = d.getMonth();
          if (monthIndex in dataMap) {
            dataMap[monthIndex].expense += Number(exp.amount) || 0;
          }
        }
      });

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        if (d.getFullYear() === now.getFullYear()) {
          const monthIndex = d.getMonth();
          if (monthIndex in dataMap) {
            dataMap[monthIndex].income += Number(inc.amount) || 0;
          }
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    return [];
  }, [expenses, incomes, timeRange]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Income vs Expenses Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis domain={[0, (dataMax) => Math.max(dataMax, 0)]} tickFormatter={(v) => v < 1000 ? `Rs. ${v}` : `Rs. ${v / 1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} allowDataOverflow={true} />
          <Tooltip
            formatter={(value, name) => [`Rs. ${value.toLocaleString()}`, name]}
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

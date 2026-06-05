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

const IncomeChart = ({ incomes, timeRange }) => {
  const data = useMemo(() => {
    if (!incomes || incomes.length === 0) return [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (timeRange === 'This Week') {
      // Monday to Sunday
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
          amount: 0 
        };
      }

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        const key = d.toISOString().split('T')[0];
        if (key in dataMap) {
          dataMap[key].amount += inc.amount;
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    if (timeRange === 'This Month') {
      // 1st to end of current month
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
          amount: 0
        };
      }

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        const key = d.toISOString().split('T')[0];
        if (key in dataMap) {
          dataMap[key].amount += inc.amount;
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    if (timeRange === 'Last 3 Months' || timeRange === 'Last 6 Months') {
      const monthsToSubtract = timeRange === 'Last 3 Months' ? 3 : 6;
      const start = new Date(todayStart);
      start.setMonth(now.getMonth() - monthsToSubtract);
      // Align start to the Monday of that week
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
          amount: 0
        };
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        for (const startStr in dataMap) {
          const bucket = dataMap[startStr];
          if (d >= bucket.rawDate && d <= bucket.endOfWeek) {
            bucket.amount += inc.amount;
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
          amount: 0
        };
      }

      incomes.forEach(inc => {
        if (!inc.date) return;
        const d = new Date(inc.date.includes('T') ? inc.date : inc.date + 'T00:00:00');
        if (d.getFullYear() === now.getFullYear()) {
          const monthIndex = d.getMonth();
          if (monthIndex in dataMap) {
            dataMap[monthIndex].amount += inc.amount;
          }
        }
      });

      return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
    }

    return [];
  }, [incomes, timeRange]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tickFormatter={(value) => value < 1000 ? `Rs.${value}` : `Rs.${value / 1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
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

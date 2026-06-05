import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#F59E0B', '#6B7280']

const Chart = ({ expenses, timeRange }) => {
    // Aggregate expenses dynamically based on selected time range
    const chartData = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

        if (timeRange === 'This Week') {
            // Monday to Sunday of current week
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
                    label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
                    rawDate: d,
                    amount: 0 
                };
            }

            expenses.forEach(exp => {
                if (!exp.date) return;
                const d = new Date(exp.date);
                const key = d.toISOString().split('T')[0];
                if (key in dataMap) {
                    dataMap[key].amount += exp.amount;
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
                    label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    rawDate: d,
                    amount: 0
                };
            }

            expenses.forEach(exp => {
                if (!exp.date) return;
                const d = new Date(exp.date);
                const key = d.toISOString().split('T')[0];
                if (key in dataMap) {
                    dataMap[key].amount += exp.amount;
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
                    label: `W/C ${currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
                    rawDate: new Date(currentWeekStart),
                    endOfWeek: endOfWeek,
                    amount: 0
                };
                
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }

            expenses.forEach(exp => {
                if (!exp.date) return;
                const d = new Date(exp.date);
                for (const startStr in dataMap) {
                    const bucket = dataMap[startStr];
                    if (d >= bucket.rawDate && d <= bucket.endOfWeek) {
                        bucket.amount += exp.amount;
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
                    label: d.toLocaleDateString(undefined, { month: 'short' }),
                    rawDate: d,
                    amount: 0
                };
            }

            expenses.forEach(exp => {
                if (!exp.date) return;
                const d = new Date(exp.date);
                if (d.getFullYear() === now.getFullYear()) {
                    const monthIndex = d.getMonth();
                    if (monthIndex in dataMap) {
                        dataMap[monthIndex].amount += exp.amount;
                    }
                }
            });

            return Object.values(dataMap).sort((a, b) => a.rawDate - b.rawDate);
        }

        return [];
    }, [expenses, timeRange]);

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-center text-gray-400">
                No data to display chart
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expenses Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickFormatter={(value) => value < 1000 ? `Rs.${value}` : `Rs.${value / 1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Expense" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default Chart
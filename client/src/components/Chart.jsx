import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#F59E0B', '#6B7280']

const Chart = ({ expenses }) => {
    // Aggregate expenses for the current week (Monday to Sunday) by day
    const chartData = useMemo(() => {
        const today = new Date();
        const day = today.getDay(); // 0 (Sun) - 6 (Sat)
        // Compute Monday of the current week
        const diffToMonday = (day + 6) % 7; // days since Monday
        const monday = new Date(today);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(today.getDate() - diffToMonday);
        // Initialize map for each day of the week
        const weekMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
            weekMap[key] = 0;
        }
        // Populate amounts
        expenses.forEach(exp => {
            if (!exp.date) return;
            const d = new Date(exp.date);
            if (isNaN(d)) return;
            const dateKey = d.toISOString().split('T')[0];
            if (dateKey in weekMap) {
                weekMap[dateKey] += exp.amount;
            }
        });
        // Convert to array sorted by date
        return Object.entries(weekMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [expenses]);

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
            {chartData.length === 0 ? (
                <div className="text-center text-gray-500">No expense data to display.</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => {
                          const d = new Date(date);
                          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }} />
                        <YAxis tickFormatter={(value) => `Rs. ${value / 1000}k`} />
                        <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} labelFormatter={(date) => {
                          const d = new Date(date);
                          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
                        }} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}

export default Chart
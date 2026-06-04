import { useState, useMemo } from 'react'

const Summary = ({ total, filteredTotal, filterCategory, expenses, totalIncome = 0, remainingBalance = 0, incomes = [] }) => {
    const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
    }, {})

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })

    const uniqueMonths = useMemo(() => {
        const months = new Set()
        const now = new Date()
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        months.add(currentMonthStr)

        expenses.forEach(exp => {
            if (exp.date) {
                const date = new Date(exp.date)
                if (!isNaN(date.getTime())) {
                    months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
                }
            }
        })
        incomes.forEach(inc => {
            if (inc.date) {
                const date = new Date(inc.date)
                if (!isNaN(date.getTime())) {
                    months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
                }
            }
        })

        return Array.from(months).sort().reverse()
    }, [expenses, incomes])

    const monthlyStats = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number)

        const spent = expenses.filter(exp => {
            const d = new Date(exp.date)
            return d.getFullYear() === year && (d.getMonth() + 1) === month
        }).reduce((sum, exp) => sum + exp.amount, 0)

        const earned = incomes.filter(inc => {
            const d = new Date(inc.date)
            return d.getFullYear() === year && (d.getMonth() + 1) === month
        }).reduce((sum, inc) => sum + inc.amount, 0)

        return { spent, earned, net: earned - spent }
    }, [selectedMonth, expenses, incomes])

    const formatMonthLabel = (monthStr) => {
        const [year, month] = monthStr.split('-')
        const date = new Date(year, month - 1)
        return date.toLocaleString('default', { month: 'long', year: 'numeric' })
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-10 mb-6">
            {/* Total Income (White Card / Emerald Text) */}
            <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1.5">Rs. {totalIncome.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Income Source
                </p>
            </div>

            {/* Total Expenses (White Card / Rose Text) */}
            <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-1.5">Rs. {total.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    {expenses.length} transactions
                </p>
            </div>

            {/* Remaining Balance (White Card / Dynamic Blue/Rose Text) */}
            <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
                <p className={`text-3xl font-extrabold mt-1.5 ${remainingBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    Rs. {remainingBalance.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${remainingBalance >= 0 ? 'bg-blue-500' : 'bg-rose-500'}`}></span>
                    {remainingBalance >= 0 ? 'Net positive' : 'Net deficit'}
                </p>
            </div>




        </div>
    )
}

export default Summary
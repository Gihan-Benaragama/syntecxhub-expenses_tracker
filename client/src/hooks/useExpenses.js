import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    getExpenses,
    createExpense,
    deleteExpense,
    updateExpense
} from '../api/expenses'

// Helper to filter items by selected time range
const filterByTimeRange = (items, timeRange) => {
    const now = new Date();
    // Get start of today (local time)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return items.filter(item => {
        if (!item.date) return false;
        // If it's a date-only string like YYYY-MM-DD, parse as local midnight
        let d;
        if (typeof item.date === 'string' && !item.date.includes('T')) {
            d = new Date(item.date + 'T00:00:00');
        } else {
            d = new Date(item.date);
        }
        
        if (isNaN(d.getTime())) return false;

        switch (timeRange) {
            case 'This Week': {
                const day = now.getDay();
                const diffToMonday = (day + 6) % 7;
                const monday = new Date(todayStart);
                monday.setDate(todayStart.getDate() - diffToMonday);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                return d >= monday && d <= sunday;
            }
            case 'This Month': {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return d >= startOfMonth && d <= endOfMonth;
            }
            case 'Last 3 Months': {
                const start = new Date(todayStart);
                start.setMonth(now.getMonth() - 3);
                return d >= start && d <= todayEnd;
            }
            case 'Last 6 Months': {
                const start = new Date(todayStart);
                start.setMonth(now.getMonth() - 6);
                return d >= start && d <= todayEnd;
            }
            case 'This Year': {
                const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                return d >= startOfYear && d <= endOfYear;
            }
            default:
                return true;
        }
    });
}

const useExpenses = (user) => {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [filterCategory, setFilterCategory] = useState('All')
    const [timeRange, setTimeRange] = useState('This Month')
    const [incomes, setIncomes] = useState(() => {
        if (user && user.email) {
            const key = `incomes_${user.email}`
            const saved = localStorage.getItem(key)
            return saved ? JSON.parse(saved) : []
        }
        return []
    })

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const data = await getExpenses()
            setExpenses(data)
            setError(null)
        } catch (err) {
            setError('Failed to fetch expenses')
        } finally {
            setLoading(false)
        }
    }

    // Load/Fetch user specific data when user changes
    useEffect(() => {
        if (user) {
            fetchExpenses()
            const key = `incomes_${user.email}`
            const saved = localStorage.getItem(key)
            setIncomes(saved ? JSON.parse(saved) : [])
        } else {
            setExpenses([])
            setIncomes([])
        }
        setError(null)
    }, [user])

    // useCallback — stable function reference
    const addExpense = useCallback(async (expenseData) => {
        try {
            const newExpense = await createExpense(expenseData)
            setExpenses(prev => [newExpense, ...prev])
        } catch (err) {
            setError('Failed to add expense')
        }
    }, [])

    // useCallback — stable function reference
    const removeExpense = useCallback(async (id) => {
        try {
            await deleteExpense(id)
            setExpenses(prev => prev.filter(exp => exp._id !== id))
        } catch (err) {
            setError('Failed to delete expense')
        }
    }, [])

    // useCallback — stable function reference
    const editExpense = useCallback(async (id, expenseData) => {
        try {
            const updated = await updateExpense(id, expenseData)
            setExpenses(prev => prev.map(exp => exp._id === id ? updated : exp))
        } catch (err) {
            setError('Failed to update expense')
        }
    }, [])

    // Filtered by Time Range (periodExpenses and periodIncomes)
    const periodExpenses = useMemo(() => {
        return filterByTimeRange(expenses, timeRange)
    }, [expenses, timeRange])

    const periodIncomes = useMemo(() => {
        return filterByTimeRange(incomes, timeRange)
    }, [incomes, timeRange])

    // Filtered by Category on top of Time Range
    const filteredExpenses = useMemo(() => {
        if (filterCategory === 'All') return periodExpenses
        return periodExpenses.filter(exp => exp.category === filterCategory)
    }, [periodExpenses, filterCategory])

    // useMemo — total period expenses
    const total = useMemo(() => {
        return periodExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    }, [periodExpenses])

    // useMemo — filtered total
    const filteredTotal = useMemo(() => {
        return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    }, [filteredExpenses])

    const addIncome = useCallback((incomeData) => {
        const newIncome = {
            _id: `inc-${Date.now()}`,
            ...incomeData,
            amount: parseFloat(incomeData.amount)
        }
        setIncomes(prev => {
            const updated = [newIncome, ...prev]
            if (user && user.email) {
                const key = `incomes_${user.email}`
                localStorage.setItem(key, JSON.stringify(updated))
            }
            return updated
        })
    }, [user])

    const removeIncome = useCallback((id) => {
        setIncomes(prev => {
            const updated = prev.filter(inc => inc._id !== id)
            if (user && user.email) {
                const key = `incomes_${user.email}`
                localStorage.setItem(key, JSON.stringify(updated))
            }
            return updated
        })
    }, [user])

    const totalIncome = useMemo(() => {
        return periodIncomes.reduce((sum, inc) => sum + inc.amount, 0)
    }, [periodIncomes])

    const remainingBalance = useMemo(() => {
        return totalIncome - total
    }, [totalIncome, total])

    return {
        expenses,
        periodExpenses,
        filteredExpenses,
        loading,
        error,
        total,
        filteredTotal,
        filterCategory,
        setFilterCategory,
        timeRange,
        setTimeRange,
        addExpense,
        removeExpense,
        editExpense,
        incomes,
        periodIncomes,
        addIncome,
        removeIncome,
        totalIncome,
        remainingBalance
    }
}

export default useExpenses
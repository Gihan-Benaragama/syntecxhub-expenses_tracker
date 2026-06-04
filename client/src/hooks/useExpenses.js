import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    getExpenses,
    createExpense,
    deleteExpense,
    updateExpense
} from '../api/expenses'

const useExpenses = () => {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [filterCategory, setFilterCategory] = useState('All')
    const [incomes, setIncomes] = useState(() => {
        const saved = localStorage.getItem('incomes')
        return saved ? JSON.parse(saved) : []
    })

    // Persist incomes locally
    useEffect(() => {
        localStorage.setItem('incomes', JSON.stringify(incomes))
    }, [incomes])

    // useEffect — fetch expenses on mount
    useEffect(() => {
        fetchExpenses()
    }, [])

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const data = await getExpenses()
            setExpenses(data)
        } catch (err) {
            setError('Failed to fetch expenses')
        } finally {
            setLoading(false)
        }
    }

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

    // useMemo — filtered list only recalculates when expenses or filter changes
    const filteredExpenses = useMemo(() => {
        if (filterCategory === 'All') return expenses
        return expenses.filter(exp => exp.category === filterCategory)
    }, [expenses, filterCategory])

    // useMemo — total only recalculates when expenses change
    const total = useMemo(() => {
        return expenses.reduce((sum, exp) => sum + exp.amount, 0)
    }, [expenses])

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
        setIncomes(prev => [newIncome, ...prev])
    }, [])

    const removeIncome = useCallback((id) => {
        setIncomes(prev => prev.filter(inc => inc._id !== id))
    }, [])

    const totalIncome = useMemo(() => {
        return incomes.reduce((sum, inc) => sum + inc.amount, 0)
    }, [incomes])

    const remainingBalance = useMemo(() => {
        return totalIncome - total
    }, [totalIncome, total])

    return {
        expenses,
        filteredExpenses,
        loading,
        error,
        total,
        filteredTotal,
        filterCategory,
        setFilterCategory,
        addExpense,
        removeExpense,
        editExpense,
        incomes,
        addIncome,
        removeIncome,
        totalIncome,
        remainingBalance
    }
}

export default useExpenses
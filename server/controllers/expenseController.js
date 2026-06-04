import Expense from '../models/Expense.js'

// GET all expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 })
        res.json(expenses)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST add new expense
export const createExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body)
        const saved = await expense.save()
        res.status(201).json(saved)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// DELETE expense
export const deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id)
        res.json({ message: 'Expense deleted!' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PUT update expense
export const updateExpense = async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        res.json(updated)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
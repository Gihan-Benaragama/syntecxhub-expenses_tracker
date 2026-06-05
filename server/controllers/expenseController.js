import Expense from '../models/Expense.js'

// GET all expenses for logged in user
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 })
        res.json(expenses)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST add new expense
export const createExpense = async (req, res) => {
    try {
        const { title, amount } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required' });
        }
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }
        const expense = new Expense({ 
            ...req.body, 
            amount: amountNum,
            user: req.user.id 
        });
        const saved = await expense.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// DELETE expense
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' })
        }

        // Check user ownership
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' })
        }

        await Expense.findByIdAndDelete(req.params.id)
        res.json({ message: 'Expense deleted!' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PUT update expense
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' })
        }

        // Check user ownership
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' })
        }

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
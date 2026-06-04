import express from 'express'
import {
    getExpenses,
    createExpense,
    deleteExpense,
    updateExpense
} from '../controllers/expenseController.js'

const router = express.Router()

router.get('/', getExpenses)
router.post('/', createExpense)
router.delete('/:id', deleteExpense)
router.put('/:id', updateExpense)

export default router
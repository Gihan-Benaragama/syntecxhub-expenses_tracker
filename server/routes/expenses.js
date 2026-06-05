import express from 'express'
import {
    getExpenses,
    createExpense,
    deleteExpense,
    updateExpense
} from '../controllers/expenseController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.use(auth)

router.get('/', getExpenses)
router.post('/', createExpense)
router.delete('/:id', deleteExpense)
router.put('/:id', updateExpense)

export default router
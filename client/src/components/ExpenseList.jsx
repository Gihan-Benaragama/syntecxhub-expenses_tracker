import { useMemo } from 'react'
import ExpenseItem from './ExpenseItem'

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [expenses])

    if (sortedExpenses.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-400">
                No expenses found. Add one above!
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                Expenses ({sortedExpenses.length})
            </h2>
            {sortedExpenses.map(expense => (
                <ExpenseItem
                    key={expense._id}
                    expense={expense}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </div>
    )
}

export default ExpenseList
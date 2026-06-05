import { useState, useCallback } from 'react';
import Modal from './Modal';

const CATEGORY_COLORS = {
    Food: 'bg-orange-100 text-orange-700',
    Transport: 'bg-blue-100 text-blue-700',
    Shopping: 'bg-pink-100 text-pink-700',
    Bills: 'bg-red-100 text-red-700',
    Health: 'bg-green-100 text-green-700',
    Education: 'bg-purple-100 text-purple-700',
    Other: 'bg-gray-100 text-gray-700'
}

const ExpenseItem = ({ expense, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
    const [editForm, setEditForm] = useState({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description || ''
    })

    const handleEdit = useCallback(async () => {
        await onEdit(expense._id, {
            ...editForm,
            amount: parseFloat(editForm.amount)
        })
        setIsEditing(false)
    }, [editForm, expense._id, onEdit]);

const handleDeleteClick = () => setShowConfirm(true);
const confirmDelete = () => {
  onDelete(expense._id);
  setShowConfirm(false);
};
const cancelDelete = () => setShowConfirm(false);

    if (isEditing) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                        value={editForm.title}
                        onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Title"
                    />
                    <input
                        type="number"
                        value={editForm.amount}
                        onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Amount"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleEdit}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (<>
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-3 flex items-center justify-between shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
                <div>
                    <p className="font-semibold text-gray-800">{expense.title}</p>
                    <p className="text-xs text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                        {expense.description && ` • ${expense.description}`}
                    </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[expense.category]}`}>
                    {expense.category}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">Rs. {expense.amount.toLocaleString()}</span>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-400 hover:text-blue-600 text-sm"
                >
                    ✏️
                </button>
                <button
                    onClick={handleDeleteClick}
                    className="text-red-400 hover:text-red-600 text-sm"
                >
                    🗑️
                </button>
            </div>
        </div>
    <Modal
  isOpen={showConfirm}
  onClose={cancelDelete}
  title="Confirm Delete"
>
  <p className="mb-4">Are you sure you want to delete this expense?</p>
  <div className="flex justify-end gap-2">
    <button
      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
      onClick={cancelDelete}
    >
      Cancel
    </button>
    <button
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={confirmDelete}
    >
      Delete
    </button>
  </div>
</Modal>
</>
);
}

export default ExpenseItem
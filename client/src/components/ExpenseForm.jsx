import { useState, useRef, useCallback } from 'react'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Other']

const ExpenseForm = ({ onAdd, onClose }) => {
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const amountRef = useRef(null)

    const handleChange = useCallback((e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        // Validation
        if (!form.title) {
            setError('Title is required');
            return;
        }
        const amountNum = parseFloat(form.amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Amount must be a positive number');
            return;
        }
        setError('');
        await onAdd({
            ...form,
            amount: amountNum
        });
        setForm({
            title: '',
            amount: '',
            category: 'Food',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        if (onClose) onClose();
    }, [form, onAdd, onClose]);

    return (
        <>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-slate-300 mb-1.5 block font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Expense title"
                        required
                        className="w-full bg-navy-dark text-black border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500" />
                </div>
                <div>
                    <label className="text-sm text-slate-300 mb-1.5 block font-medium">Amount (Rs.)</label>
                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        ref={amountRef}
                        className="w-full bg-navy-dark text-black border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500" />
                </div>
                <div>
                    <label className="text-sm text-slate-300 mb-1.5 block font-medium">Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full bg-white text-black border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"

                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-white text-black">{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm text-slate-300 mb-1.5 block font-medium">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="w-full bg-navy-dark border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm text-slate-300 mb-1.5 block font-medium">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Optional description"
                        className="w-full bg-navy-dark text-black border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500" />
                </div>
            </div>
            <button
                type="submit"
                className="mt-4 w-full bg-accent hover:bg-accent-hover text-white font-bold text-sm uppercase tracking-wide py-3 px-6 rounded-xl cursor-pointer border border-accent hover:border-accent-hover transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]"
            >
                + Add Expense
            </button>
        </form>
    </>
  )
}

export default ExpenseForm
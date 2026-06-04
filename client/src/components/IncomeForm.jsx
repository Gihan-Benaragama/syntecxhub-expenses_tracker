import { useState, useRef, useCallback } from 'react'

const IncomeForm = ({ onAdd, onClose }) => {
    const [form, setForm] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    })

    const amountRef = useRef(null)

    const handleChange = useCallback((e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        if (!form.title || !form.amount) return
        await onAdd({
            ...form,
            amount: parseFloat(form.amount)
        })
        setForm({
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: ''
        })
        onClose()
    }, [form, onAdd, onClose])

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm text-slate-300 mb-1.5 block font-medium">Income Source</label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Salary, Freelance, Investment"
                    required
                    className="w-full bg-navy-dark text-slate-100 border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500"
                />
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
                    className="w-full bg-navy-dark text-slate-100 border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500"
                />
            </div>
            <div>
                <label className="text-sm text-slate-300 mb-1.5 block font-medium">Date</label>
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-navy-dark text-slate-100 border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition [color-scheme:dark]"
                />
            </div>
            <div>
                <label className="text-sm text-slate-300 mb-1.5 block font-medium">Description</label>
                <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional description"
                    className="w-full bg-navy-dark text-slate-100 border border-navy-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500"
                />
            </div>
            <button
                type="submit"
                className="mt-2 w-full bg-accent hover:bg-accent-hover text-navy-dark font-bold py-2.5 rounded-lg transition shadow-md shadow-accent/10 hover:shadow-lg hover:shadow-accent/20"
            >
                + Add Income
            </button>
        </form>
    )
}

export default IncomeForm

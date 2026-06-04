import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Other']
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true })

export default mongoose.model('Expense', expenseSchema)
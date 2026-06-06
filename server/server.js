import dotenv from 'dotenv'
dotenv.config() // MUST be first

//1044247391071-ltlissdmetmev628mfn6rdop7nqnd4sc.apps.googleusercontent.com - cliwntid

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dns from 'dns'
import expenseRoutes from './routes/expenses.js'
import userRoutes from './routes/userRoute.js'
import passport from 'passport'
import googleAuthRoutes from './routes/googleAuth.js'
import './middleware/googleStrategy.js' // initialize Google strategy (needs env vars)

// Fix for Node.js querySrv ECONNREFUSED error on some Windows/VPN environments.
const currentDns = dns.getServers()
if (!currentDns.length || (currentDns.length === 1 && (currentDns[0] === '127.0.0.1' || currentDns[0] === '::1'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
}

const app = express()

app.use(cors())
app.use(express.json())

// Initialize passport
app.use(passport.initialize())

// Routes
app.use('/api/users', userRoutes)
app.use('/api/users', googleAuthRoutes) // Google OAuth routes
app.use('/api/expenses', expenseRoutes)

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' })
})

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI, {
    family: 4
})
    .then(() => {
        console.log('MongoDB connected!')
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    })
    .catch((err) => console.log('Connection error:', err.message))
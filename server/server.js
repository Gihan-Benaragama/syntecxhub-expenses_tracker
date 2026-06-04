import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import dns from 'dns'
import expenseRoutes from './routes/expenses.js'

// Fix for Node.js querySrv ECONNREFUSED error on some Windows/VPN environments.
// If the detected DNS server is localhost/loopback, fall back to Google & Cloudflare DNS.
const currentDns = dns.getServers()
if (!currentDns.length || (currentDns.length === 1 && (currentDns[0] === '127.0.0.1' || currentDns[0] === '::1'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
}

dotenv.config()


const app = express()

app.use(cors())
app.use(express.json())

// Routes
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
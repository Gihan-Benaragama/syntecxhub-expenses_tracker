import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Generate JWT token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    return jwt.sign({ id }, secret, {
        expiresIn: '30d'
    })
}

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        // Check for existing user
        const userExists = await User.findOne({ email: email.toLowerCase() })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        })

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        } else {
            res.status(400).json({ message: 'Invalid user data' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// @desc    Authenticate a user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' })
        }

        // Check for user
        const user = await User.findOne({ email: email.toLowerCase() })

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        } else {
            res.status(400).json({ message: 'Invalid email or password' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

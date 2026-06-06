import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret'
    return jwt.sign({ id }, secret, { expiresIn: '30d' })
}

// @desc    Authenticate user via Google OAuth
// @route   POST /api/users/google-auth
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { access_token } = req.body

        if (!access_token) {
            return res.status(400).json({ message: 'No access token provided' })
        }

        // Fetch user profile from Google
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        })

        if (!googleRes.ok) {
            return res.status(401).json({ message: 'Invalid Google token' })
        }

        const profile = await googleRes.json()

        const email = profile.email?.toLowerCase()
        const name = profile.name || profile.given_name || 'GoogleUser'

        if (!email) {
            return res.status(400).json({ message: 'No email found in Google profile' })
        }

        // Find existing user or create new one
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({ name, email, password: 'google_oauth_' + Date.now() })

        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })

    } catch (err) {
        console.error('Google auth error:', err)
        res.status(500).json({ message: 'Google authentication failed' })
    }
}
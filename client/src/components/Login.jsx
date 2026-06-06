import { useState, useCallback, useEffect, useRef } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { loginUser, registerUser } from '../api/expenses'
import slide1 from '../assets/slide1.png'
import slide2 from '../assets/slide2.png'
import slide3 from '../assets/slide3.png'
import slide4 from '../assets/slide4.png'
import slide5 from '../assets/slide5.png'
import slide6 from '../assets/slide6.png'

const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ email: '', password: '', name: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // ── Mosaic block-wipe slideshow ──────────────────────────────────────────
    const MOSAIC_COLS = 8
    const MOSAIC_ROWS = 5
    const STEP_DELAY = 80   // ms between each diagonal step
    const BLOCK_DUR = 450  // ms per individual block animation
    // time for all blocks to finish = last diagonal index × step + block duration
    const COVER_MS = (MOSAIC_COLS + MOSAIC_ROWS - 2) * STEP_DELAY + BLOCK_DUR // ≈ 838ms
    const PAUSE_MS = 120  // hold fully-covered before revealing

    const slideData = [
        { img: slide1, title: '', subtitle: '' },
        { img: slide2, title: 'Track Expenses', subtitle: 'Stay on top of your finances and never miss a transaction again' },
        { img: slide3, title: 'Add Transactions', subtitle: 'Log your daily expenses in seconds and keep everything organized' },
        { img: slide4, title: 'View Reports', subtitle: 'Get detailed reports and understand exactly where your money goes' },
        { img: slide5, title: 'Smart Analytics', subtitle: 'Visualize your spending patterns with beautiful interactive charts' },
        { img: slide6, title: 'Stay Secure', subtitle: 'Your financial data is fully encrypted and always protected' },
    ]

    const [currentIdx, setCurrentIdx] = useState(0)
    const [nextIdx, setNextIdx] = useState(1)
    const [blocksCovered, setBlocksCovered] = useState(false)
    const isRunning = useRef(false)
    const nextIdxRef = useRef(1)   // ref so setInterval closure always reads latest nextIdx

    useEffect(() => {
        const interval = setInterval(() => {
            if (isRunning.current) return
            isRunning.current = true

            // Phase 1 – blocks scale IN (cover Layer 2 / current image)
            setBlocksCovered(true)

            setTimeout(() => {
                // While fully covered: advance current → next, preload new next
                const ni = nextIdxRef.current
                setCurrentIdx(ni)
                const newNext = (ni + 1) % slideData.length
                nextIdxRef.current = newNext
                setNextIdx(newNext)

                setTimeout(() => {
                    // Phase 2 – blocks scale OUT (reveal Layer 1 / new next image)
                    setBlocksCovered(false)

                    setTimeout(() => {
                        isRunning.current = false
                    }, COVER_MS)
                }, PAUSE_MS)
            }, COVER_MS)
        }, 5500)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // ────────────────────────────────────────────────────────────────────────


    const handleChange = useCallback((e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        setError('')

        // Simple validation
        if (!form.email || !form.password) {
            setError('Please fill in all fields.')
            return
        }
        if (!isLogin && !form.name) {
            setError('Please enter your name.')
            return
        }

        // Email pattern check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email)) {
            setError('Please enter a valid email address.')
            return
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)

        try {
            let userData
            if (isLogin) {
                userData = await loginUser({ email: form.email, password: form.password })
            } else {
                userData = await registerUser({ name: form.name, email: form.email, password: form.password })
            }
            // Add avatar for local rendering
            userData.avatar = userData.name.charAt(0).toUpperCase()
            onLoginSuccess(userData)
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }

    }, [form, isLogin, onLoginSuccess])

    const [googleLoading, setGoogleLoading] = useState(false)

    const googleLogin = useGoogleLogin({
        onSuccess: async (response) => {
            console.log(response)
            setGoogleLoading(true)
            setError('')
            try {
                const res = await fetch('https://syntecxhub-expenses-tracker.onrender.com/api/users/google-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: response.access_token })
                })
                const userData = await res.json()
                if (!res.ok) {
                    setError(userData.message || 'Google authentication failed.')
                    return
                }
                userData.avatar = userData.name?.charAt(0).toUpperCase() || 'G'
                onLoginSuccess(userData)
            } catch {
                setError('Could not connect to server. Make sure the backend is running.')
            } finally {
                setGoogleLoading(false)
            }
        },
        onError: () => {
            setError('Google login failed. Please try again.')
        }
    })


    return (
        <div className="min-h-screen bg-slate-50 flex items-stretch font-sans text-slate-800">
            {/* Left Section — Mosaic Block-Wipe Slideshow — Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden select-none">

                {/* Layer 1 — NEXT image preloaded underneath (z:0) */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundImage: `url('${slideData[nextIdx].img}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                }} />

                {/* Layer 2 — CURRENT image on top (z:1); covered by mosaic blocks during wipe */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    backgroundImage: `url('${slideData[currentIdx].img}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                }} />

                {/* Layer 3 — Dark blue gradient overlay (z:2) */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                    background: 'linear-gradient(135deg, rgba(10,26,60,0.78) 0%, rgba(27,98,205,0.32) 55%, transparent 100%)',
                }} />

                {/* Layer 4 — Slide text + progress dots (z:3) */}
                <div style={{
                    position: 'relative', zIndex: 3,
                    padding: '4rem', marginTop: '3rem', maxWidth: '28rem',
                }}>
                    <h2 style={{
                        fontSize: '2.6rem', fontWeight: 700, color: '#ffffff',
                        letterSpacing: '-0.02em', lineHeight: 1.15,
                        textShadow: '0 2px 14px rgba(10,26,60,0.55)',
                        transition: 'opacity 0.4s ease',
                    }}>
                        {slideData[currentIdx].title}
                    </h2>
                    <p style={{
                        fontSize: '1rem', color: 'rgba(255,255,255,0.82)',
                        marginTop: '0.75rem', fontWeight: 500,
                        letterSpacing: '0.02em',
                        textShadow: '0 1px 8px rgba(10,26,60,0.4)',
                        transition: 'opacity 0.4s ease',
                    }}>
                        {slideData[currentIdx].subtitle}
                    </p>

                    {/* Progress dots */}
                    <div style={{ display: 'flex', gap: '7px', marginTop: '2rem' }}>
                        {slideData.map((_, di) => di === 0 ? null : (
                            <div key={di} style={{
                                height: '6px',
                                width: di === currentIdx ? '26px' : '6px',
                                borderRadius: '9999px',
                                background: di === currentIdx ? '#ffffff' : 'rgba(255,255,255,0.35)',
                                transition: 'all 0.4s ease',
                            }} />
                        ))}
                    </div>
                </div>

                {/* Layer 5 — 8×5 Mosaic block grid (z:4) covers Layer 2 during wipe */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 4,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${MOSAIC_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${MOSAIC_ROWS}, 1fr)`,
                    pointerEvents: 'none',
                }}>
                    {Array.from({ length: MOSAIC_COLS * MOSAIC_ROWS }, (_, i) => {
                        const col = i % MOSAIC_COLS
                        const row = Math.floor(i / MOSAIC_COLS)
                        const diag = col + row
                        const delay = diag * STEP_DELAY
                        return (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(8, 18, 45, 0.97)',
                                    borderRadius: '2px',
                                    transform: blocksCovered ? 'scale(1)' : 'scale(0)',
                                    transition: `transform ${BLOCK_DUR}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
                                    transformOrigin: 'center',
                                }}
                            />
                        )
                    })}
                </div>
                {/* ───────────────────────────────────────────────────────────── */}

            </div>

            {/* Right Section (Login Form Container) */}
            <div className="w-full lg:w-5/12 bg-white flex flex-col justify-center items-center px-6 py-12 md:px-16 relative shadow-2xl z-20">

                {/* SVG Diagonal Chevron Divider - Desktop Only */}
                <div className="absolute top-0 bottom-0 right-full w-32 hidden lg:block pointer-events-none z-10">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                        {/* White polygon chevron pointing left */}
                        <path d="M100 0 L55 0 L15 50 L55 100 L100 100 Z" fill="#ffffff" />
                        {/* Blue chevron stripe boundary */}
                        <path d="M55 0 L15 50 L55 100" fill="none" stroke="#1b62cd" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="w-full max-w-[380px] space-y-7 z-10">
                    {/* Centered Hexagonal Logo */}
                    <div className="text-center">
                        <svg className="w-[72px] h-[72px] mx-auto mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Stylized Hexagon 'C' Logo in Hex Color Matching Mockup */}
                            <path d="M75 35 L50 20 L20 37 L20 63 L50 80 L75 65 L75 52 L50 67 L35 58 L35 42 L50 33 L75 48 Z" fill="#1b62cd" />
                        </svg>
                        <h1 className="text-3xl font-extrabold text-[#0a2240] tracking-tight leading-none">
                            {isLogin ? 'Welcome' : 'Register'}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-2">
                            {isLogin ? 'Please login to your account' : 'Please register your account'}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name field (Register only) */}
                        {!isLogin && (
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    required
                                    className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#1b62cd] focus:ring-2 focus:ring-[#1b62cd]/10 transition duration-200 placeholder-slate-400"
                                />
                            </div>
                        )}

                        {/* Email / Username field */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Username or Email"
                                required
                                className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#1b62cd] focus:ring-2 focus:ring-[#1b62cd]/10 transition duration-200 placeholder-slate-400"
                            />
                        </div>

                        {/* Password field */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:border-[#1b62cd] focus:ring-2 focus:ring-[#1b62cd]/10 transition duration-200 placeholder-slate-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Remember Me and Forgot Password links (Login only) */}
                        {isLogin && (
                            <div className="flex items-center justify-between text-xs font-semibold select-none pt-1">
                                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#1b62cd] border-slate-300 rounded focus:ring-[#1b62cd]"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#forgot" className="text-[#1b62cd] hover:underline font-bold">
                                    Forgot Password?
                                </a>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1b62cd] hover:bg-[#1552b9] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-[#1b62cd]/10 hover:shadow-[#1b62cd]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed select-none"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Please wait...
                                </>
                            ) : (
                                isLogin ? 'Login' : 'Sign Up'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-1">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="text-xs text-slate-400 font-medium select-none">or continue with</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        {/* Google Sign-In Button */}
                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            disabled={googleLoading}
                            className="w-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-sm shadow-sm hover:shadow-md select-none disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {googleLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    {/* Official Google SVG logo */}
                                    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        <path fill="none" d="M0 0h48v48H0z" />
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Registration Prompt */}
                    <div className="text-center text-xs font-semibold text-slate-500 pt-2">
                        {isLogin ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(false); setError(''); }}
                                    className="text-[#1b62cd] hover:underline font-bold"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(true); setError(''); }}
                                    className="text-[#1b62cd] hover:underline font-bold"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

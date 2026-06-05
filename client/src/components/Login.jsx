import { useState, useCallback } from 'react'
import { loginUser, registerUser } from '../api/expenses'

const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ email: '', password: '', name: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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

    return (
        <div className="min-h-screen bg-slate-50 flex items-stretch font-sans text-slate-800">
            {/* Left Section (Building Background image) - Hidden on Mobile */}
            <div 
                className="hidden lg:flex lg:w-7/12 relative bg-cover bg-center flex-col justify-start p-16 select-none"
                style={{ backgroundImage: "url('/building_bg.png')" }}
            >
                {/* Darker/Lighter clean overlay to read text easily if necessary */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1b62cd]/5 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Header Text Overlay */}
                <div className="relative z-10 max-w-md mt-12 animate-fade-in-up">
                    <h2 className="text-[2.6rem] font-bold text-[#0a2240] tracking-tight leading-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-md text-[#3a506b] mt-3 font-medium tracking-wide">
                        {isLogin ? 'Sign in to continue to your account' : 'Sign up to get started tracking your expenses'}
                    </p>
                </div>
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

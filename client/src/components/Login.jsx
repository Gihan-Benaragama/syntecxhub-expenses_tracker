import { useState, useCallback } from 'react'

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

        // Mock authentication timeout
        setTimeout(() => {
            setLoading(false)
            const userData = {
                name: isLogin ? (form.email.split('@')[0]) : form.name,
                email: form.email,
                avatar: form.email.charAt(0).toUpperCase()
            }
            onLoginSuccess(userData)
        }, 1200)

    }, [form, isLogin, onLoginSuccess])

    return (
        <div className="min-h-screen bg-[#0A1128] text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-4">
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00B4D8]/20 blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#6366F1]/15 blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[150px] pointer-events-none"></div>

            {/* Logo and Brand Header */}
            <div className="mb-8 text-center z-10 animate-fade-in-up">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-navy-dark text-2xl font-black shadow-lg shadow-accent/25 mx-auto mb-3">
                    Syn
                </div>
                <h1 className="text-2xl font-extrabold tracking-wider leading-none uppercase text-slate-100">Syntecxhub</h1>
                <span className="text-xs text-accent font-bold tracking-widest uppercase mt-1 block">Expense & Wealth Tracker</span>
            </div>

            {/* Glassmorphism Auth Card */}
            <div className="w-full max-w-md bg-navy/60 backdrop-blur-xl border border-navy-border/80 rounded-3xl p-8 shadow-2xl z-10 animate-fade-in-up">
                {/* Mode Selector Tabs */}
                <div className="flex bg-navy-dark/60 border border-navy-border/50 rounded-xl p-1 mb-6 gap-1">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                            isLogin
                                ? 'bg-accent text-navy-dark shadow-md shadow-accent/15'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                            !isLogin
                                ? 'bg-accent text-navy-dark shadow-md shadow-accent/15'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2 animate-fade-in-up">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field (Register Only) */}
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                                    👤
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full bg-navy-dark/70 text-slate-100 border border-navy-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                                ✉️
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="name@domain.com"
                                required
                                className="w-full bg-navy-dark/70 text-slate-100 border border-navy-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-slate-300 font-bold uppercase tracking-wider block">Password</label>
                            {isLogin && (
                                <a href="#forgot" className="text-[10px] text-accent hover:underline font-bold">
                                    Forgot?
                                </a>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                                🔒
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full bg-navy-dark/70 text-slate-100 border border-navy-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-slate-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 text-sm transition"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent-hover text-navy-dark font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-accent/15 hover:shadow-accent/30 mt-6 flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-navy-dark border-t-transparent rounded-full animate-spin"></span>
                                Authenticating...
                            </>
                        ) : (
                            isLogin ? 'Sign In to Syntecxhub' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Footer Disclaimer */}
                <p className="text-center text-[10px] text-slate-400 mt-6 leading-relaxed">
                    By continuing, you agree to Syntecxhub's <br />
                    <span className="text-slate-300 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-300 underline cursor-pointer">Privacy Policy</span>.
                </p>
            </div>
        </div>
    )
}

export default Login

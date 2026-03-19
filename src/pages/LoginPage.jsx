import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Zap, Loader2 } from 'lucide-react'


export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isFilled = email !== '' && password !== '';

    const handleLogin = async (e) => {
        e.preventDefault()
        // if (!isValid) return

        setLoading(true)
        setError('')

        try {
            const validEmail = 'demo@gmail.com'
            const validPassword = '123456'
            await new Promise((res) => setTimeout(res, 500))

            if (email === validEmail && password === validPassword) {
                login(email)
                navigate('/home')
            } else {
                throw new Error('Invalid credentials')
            }

        } catch (err) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 ">
            <div className="w-full max-w-md card p-8 space-y-7">
                <span className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center mx-auto">
                    <Zap size={16} className="text-white" fill="white" />
                </span>
                {/* Title */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-brand-400">
                        Welcome to AgentforceX
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Enter you details to continue.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600">Email</label>
                        <div className="flex items-center border rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-brand-300">
                            <Mail size={16} className="text-gray-400 mr-2" />
                            <input
                                type="email"
                                className="w-full outline-none text-sm"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-600">Password</label>

                        <div className="flex items-center border rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-brand-300">

                            <Lock size={16} className="text-gray-400 mr-2" />

                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full outline-none text-sm"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>

                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={!isFilled || loading}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition
                           ${!isFilled || loading
                                ? 'btn-primary text-white opacity-60 cursor-not-allowed'
                                : 'btn-primary text-white hover:bg-brand-600'
                            }
  `}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500">
                    Don’t have an account?{' '}
                    <span
                        className="text-brand-400 font-medium cursor-pointer hover:underline font-bold"
                        onClick={() => navigate('/')}
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    )
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            await login({
                email: email.trim().toLowerCase(),
                password,
            })

            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthLayout activeTab="login">
            <div className="auth-heading">
                <h1>Welcome back</h1>
                <p>Sign in to see your projects, invitations and skill matches.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="email">College email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="student@college.edu"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="form-field">
                    <div className="label-row">
                        <label htmlFor="password">Password</label>
                        <a href="mailto:help@skillsync.edu?subject=Password%20Recovery">
                            Forgot password?
                        </a>
                    </div>

                    <div className="input-wrapper">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitting}
                >
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="auth-switch">
                New to SkillSync? <Link to="/register">Create an account</Link>
            </p>
        </AuthLayout>
    )
}

export default Login

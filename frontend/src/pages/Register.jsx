import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

const initialForm = {
    prn: '',
    name: '',
    email: '',
    password: '',
    department: '',
    classYear: '',
    division: '',
}

function Register() {
    const [form, setForm] = useState(initialForm)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState('')

    const { register } = useAuth()
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }))

        setError('')
        setFieldErrors([])
        setSuccess('')
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setFieldErrors([])
        setSuccess('')

        const classYear = Number(form.classYear)

        if (!Number.isInteger(classYear) || classYear < 1) {
            setError('Enter a valid class year.')
            return
        }

        setSubmitting(true)

        try {
            await register({
                prn: form.prn.trim(),
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                department: form.department.trim(),
                classYear,
                ...(form.division.trim() && {
                    division: form.division.trim(),
                }),
            })

            setSuccess('Account created. Taking you to sign in...')
            setForm(initialForm)

            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 1200)
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
            setFieldErrors(err.errors || [])
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthLayout activeTab="register">
            <div className="auth-heading">
                <h1>Create your account</h1>
                <p>Use your college details so teammates can find and trust your profile.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="prn">PRN</label>
                        <input
                            id="prn"
                            name="prn"
                            value={form.prn}
                            onChange={handleChange}
                            placeholder="Registration number"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="name">Full name</label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            minLength={2}
                            autoComplete="name"
                            required
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="email">College email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="student@college.edu"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="password">Password</label>

                    <div className="input-wrapper">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            minLength={8}
                            autoComplete="new-password"
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

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="department">Department</label>
                        <input
                            id="department"
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            placeholder="e.g. CSE"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="classYear">Class year</label>
                        <input
                            id="classYear"
                            name="classYear"
                            type="number"
                            min="1"
                            step="1"
                            value={form.classYear}
                            onChange={handleChange}
                            placeholder="e.g. 3"
                            required
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="division">Division (optional)</label>
                    <input
                        id="division"
                        name="division"
                        value={form.division}
                        onChange={handleChange}
                        placeholder="e.g. A"
                    />
                </div>

                {fieldErrors.map((item, index) => (
                    <p className="auth-error" key={`${item.field}-${index}`}>
                        {item.field}: {item.message}
                    </p>
                ))}

                {error && (
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="auth-success" role="status">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitting}
                >
                    {submitting ? 'Creating account...' : 'Create account'}
                </button>
            </form>

            <p className="auth-switch">
                Already registered? <Link to="/login">Sign in</Link>
            </p>
        </AuthLayout>
    )
}

export default Register

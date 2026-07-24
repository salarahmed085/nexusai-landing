import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../Icons.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = {};
    if (!EMAIL_RE.test(form.email)) clientErrors.email = 'Enter a valid email';
    if (!form.password) clientErrors.password = 'Password is required';
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm bg-dark-900/50 border border-dark-800/50 rounded-2xl p-8 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Logo />
          <span className="text-xl font-bold text-white">NexusAI</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Log in</h1>

        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />

        {errors.general && <p className="text-red-400 text-sm">{errors.general}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold transition-all disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-dark-400 text-center">
          No account? <Link to="/signup" className="text-brand-400 hover:text-brand-300">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-sm text-dark-300 mb-1">{label}</label>
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg bg-dark-800 border text-white outline-none transition-colors ${
          error ? 'border-red-500' : 'border-dark-700 focus:border-brand-400'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

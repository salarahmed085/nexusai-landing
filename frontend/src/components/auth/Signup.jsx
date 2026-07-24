import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../Icons.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (!name.trim() || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email';
  if (password.length < 8) errors.password = 'At least 8 characters';
  else if (!/[A-Z]/.test(password)) errors.password = 'Needs an uppercase letter';
  else if (!/[0-9]/.test(password)) errors.password = 'Needs a number';
  if (confirm !== password) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
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
        <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>

        <Field label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
        <Field label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={onChange} error={errors.confirm} />

        {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold transition-all disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="text-sm text-dark-400 text-center">
          Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300">Log in</Link>
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

import { useState, useRef } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useToast } from '../context/ToastContext.jsx';

import { demoRequestApi } from '../services/demoRequestApi.js';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const INTERESTS = ['Product Demo', 'Enterprise Plan', 'Partnership', 'Integration Support', 'Other'];
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const initialForm = {
  fullName: '',
  email: '',
  company: '',
  companySize: '',
  preferredDate: '',
  interest: '',
  message: '',
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function validate(form, file) {
  const errors = {};

  if (!form.fullName.trim() || form.fullName.trim().length < 2 || form.fullName.trim().length > 100) {
    errors.fullName = 'Full name must be between 2 and 100 characters.';
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.company.trim() || form.company.trim().length < 2 || form.company.trim().length > 150) {
    errors.company = 'Company name must be between 2 and 150 characters.';
  }

  if (!COMPANY_SIZES.includes(form.companySize)) {
    errors.companySize = 'Please select a company size.';
  }

  if (!form.preferredDate) {
    errors.preferredDate = 'Preferred date is required.';
  } else if (form.preferredDate < todayStr()) {
    errors.preferredDate = 'Preferred date cannot be in the past.';
  }

  if (!INTERESTS.includes(form.interest)) {
    errors.interest = 'Please select an area of interest.';
  }

  if (!form.message.trim() || form.message.trim().length < 10 || form.message.trim().length > 1000) {
    errors.message = 'Message must be between 10 and 1000 characters.';
  }

  if (file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.attachment = 'Only JPG, PNG, WEBP, or GIF images are allowed.';
    } else if (file.size > MAX_FILE_SIZE) {
      errors.attachment = 'File must be smaller than 5MB.';
    }
  }

  return errors;
}

export default function DemoRequestForm() {
  const ref = useReveal();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const resetForm = () => {
    setForm(initialForm);
    setFile(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate(form, file);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      addToast('Please fix the highlighted fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value.trim ? value.trim() : value));
      if (file) fd.append('attachment', file);

      await demoRequestApi.submit(fd);
      addToast('Demo request submitted! We will be in touch soon.', 'success');
      resetForm();
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
        addToast('Please fix the highlighted fields.', 'error');
      } else {
        addToast(err.message || 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-dark-800/80 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
      errors[field] ? 'border-red-500' : 'border-dark-700'
    }`;

  return (
    <section id="request-demo" className="py-20 sm:py-28 px-4">

      <div ref={ref} className="reveal max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            Get Started
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Request a Demo</h2>
          <p className="text-dark-400">Tell us about your team and we'll set up a personalized walkthrough.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name" error={errors.fullName}>
              <input
                name="fullName" type="text" value={form.fullName} onChange={onChange}
                placeholder="Jane Doe" className={inputClass('fullName')}
              />
            </Field>
            <Field label="Work Email" error={errors.email}>
              <input
                name="email" type="email" value={form.email} onChange={onChange}
                placeholder="jane@company.com" className={inputClass('email')}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Company" error={errors.company}>
              <input
                name="company" type="text" value={form.company} onChange={onChange}
                placeholder="Acme Inc." className={inputClass('company')}
              />
            </Field>
            <Field label="Company Size" error={errors.companySize}>
              <select name="companySize" value={form.companySize} onChange={onChange} className={inputClass('companySize')}>
                <option value="" disabled>Select size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>{size} employees</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Preferred Demo Date" error={errors.preferredDate}>
              <input
                name="preferredDate" type="date" min={todayStr()} value={form.preferredDate} onChange={onChange}
                className={inputClass('preferredDate')}
              />
            </Field>
            <Field label="Area of Interest" error={errors.interest}>
              <select name="interest" value={form.interest} onChange={onChange} className={inputClass('interest')}>
                <option value="" disabled>Select an option</option>
                {INTERESTS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Message" error={errors.message}>
            <textarea
              name="message" rows={4} value={form.message} onChange={onChange}
              placeholder="What are you hoping to achieve with NexusAI?"
              className={inputClass('message')}
            />
          </Field>

          <Field label="Screenshot or Logo (optional)" error={errors.attachment}>
            <input
              ref={fileInputRef} name="attachment" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onFileChange}
              className="w-full text-sm text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-500/10 file:text-brand-400 file:font-medium hover:file:bg-brand-500/20 file:cursor-pointer cursor-pointer"
            />
            {file && <p className="text-xs text-dark-500 mt-1">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Submitting...' : 'Request Demo'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-dark-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

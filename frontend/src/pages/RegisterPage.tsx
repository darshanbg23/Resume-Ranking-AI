import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'candidate',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const userData = await register({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        role: formData.role as 'candidate' | 'recruiter',
        phone: formData.phone,
      });

      const dashboardPaths: Record<string, string> = {
        candidate: '/candidate/dashboard',
        recruiter: '/recruiter/dashboard',
        admin: '/admin/dashboard',
      };
      const redirectPath = dashboardPaths[userData.role] || '/candidate/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none disabled:opacity-50 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-zinc-600";

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-50 dark:bg-black">
        {/* Gradient orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">ResumeRank AI</span>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center -mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-blue-600 dark:text-blue-500">
              Join the Platform
            </p>
            <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-5 tracking-tight text-gray-900 dark:text-white">
              Start Your<br />
              <span className="text-blue-600 dark:text-blue-500">AI-Powered Journey</span>
            </h2>
            <p className="text-base leading-relaxed max-w-md mb-10 text-gray-600 dark:text-zinc-400">
              Whether you're a candidate seeking the perfect role or a recruiter finding top talent — our AI does the heavy lifting.
            </p>

            {/* Role Cards — Clean, no border highlight on selected */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Candidate</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Upload resume • Get AI insights • Find matching jobs</p>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Recruiter</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Post jobs • Screen resumes • Rank candidates with AI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacer */}
          <div />
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-black">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:text-left">
            <div className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create Account</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Get started with ResumeRank AI</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl border bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">First Name</label>
                <input
                  id="first_name" name="first_name" type="text" required disabled={isLoading}
                  value={formData.first_name} onChange={handleChange}
                  className={inputClasses}
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">Last Name</label>
                <input
                  id="last_name" name="last_name" type="text" required disabled={isLoading}
                  value={formData.last_name} onChange={handleChange}
                  className={inputClasses}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">Email Address</label>
              <input
                id="email" name="email" type="email" required disabled={isLoading}
                value={formData.email} onChange={handleChange}
                className={inputClasses}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                Phone <span className="text-gray-400 dark:text-zinc-600">(optional)</span>
              </label>
              <input
                id="phone" name="phone" type="tel" disabled={isLoading}
                value={formData.phone} onChange={handleChange}
                className={inputClasses}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">I am a</label>
              <select
                id="role" name="role" value={formData.role} onChange={handleChange} disabled={isLoading}
                className={inputClasses}
              >
                <option value="candidate">Candidate — Looking for jobs</option>
                <option value="recruiter">Recruiter — Hiring talent</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">Password</label>
                <input
                  id="password" name="password" type="password" required disabled={isLoading}
                  value={formData.password} onChange={handleChange}
                  className={inputClasses}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">Confirm</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required disabled={isLoading}
                  value={formData.confirmPassword} onChange={handleChange}
                  className={inputClasses}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full px-4 py-3 font-semibold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 text-white mt-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                boxShadow: '0 0 24px rgba(37,99,235,0.25)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(37,99,235,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px rgba(37,99,235,0.25)')}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

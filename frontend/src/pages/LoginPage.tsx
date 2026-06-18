import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await login(formData.email, formData.password);
      const dashboardPaths: Record<string, string> = {
        candidate: '/candidate/dashboard',
        recruiter: '/recruiter/dashboard',
        admin: '/admin/dashboard',
      };
      const redirectPath = dashboardPaths[userData.role] || '/candidate/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const features = [
    {
      icon: '📄',
      title: 'Smart Resume Parsing',
      desc: 'AI extracts skills, experience & education from your resume automatically.',
    },
    {
      icon: '🎯',
      title: 'Job Matching',
      desc: 'Semantic AI matches your profile to the most relevant opportunities.',
    },
    {
      icon: '📊',
      title: 'Candidate Ranking',
      desc: 'Get ranked against other applicants with transparent scoring.',
    },
    {
      icon: '🔔',
      title: 'Real-time Updates',
      desc: 'Track your applications and get notified on status changes.',
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-50 dark:bg-black">
        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">ResumeRank AI</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center -mt-4">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-blue-600 dark:text-blue-500">
                AI-Powered Recruitment
              </p>
              <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-5 tracking-tight text-gray-900 dark:text-white">
                Intelligent Resume<br />
                <span className="text-blue-600 dark:text-blue-500">Screening & Ranking</span>
              </h2>
              <p className="text-base leading-relaxed max-w-md text-gray-600 dark:text-zinc-400">
                Automate your hiring with NLP-powered analysis. Match candidates to jobs with semantic AI, not just keywords.
              </p>
            </div>

            {/* Feature Cards — 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3 text-xl group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</p>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-zinc-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom spacer */}
          <div />
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-black">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="text-center mb-10 lg:text-left">
            <div className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Sign in to your ResumeRank account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-xl border bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                id="email" name="email" type="email" required disabled={isLoading}
                value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none disabled:opacity-50 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-zinc-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-zinc-300">
                Password
              </label>
              <input
                id="password" name="password" type="password" required disabled={isLoading}
                value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none disabled:opacity-50 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 dark:placeholder-zinc-600"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" disabled={isLoading} className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-gray-500 dark:text-zinc-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full px-4 py-3 font-semibold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
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
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-500 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

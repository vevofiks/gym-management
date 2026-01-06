import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Check, X, ArrowRight, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validation Rules
  const validations = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains a number', valid: /[0-9]/.test(password) },
    { label: 'Contains special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const isPasswordValid = validations.every((v) => v.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isPasswordValid) {
        setError('Password does not meet security requirements');
        return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock Credential Check
      if (email === 'admin@fitpulse.com' && password === 'Admin@123') {
        onLogin();
      } else {
        setError('Invalid email or password. (Try: admin@fitpulse.com / Admin@123)');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-[#0B1120]">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        
        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-[#151C2C]">
          
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to access your FitPulse Admin Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                      setPassword(e.target.value);
                      setTouched(true);
                  }}
                  className={`block w-full rounded-lg border bg-gray-50 p-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 outline-none focus:ring-1 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-colors
                    ${touched && !isPasswordValid 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500' 
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Validation Checklist (Shows when typing) */}
            {password.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Password Requirements:</p>
                    <div className="space-y-1">
                        {validations.map((rule, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                                {rule.valid ? (
                                    <Check size={12} className="text-green-500" />
                                ) : (
                                    <X size={12} className="text-gray-300 dark:text-gray-600" />
                                )}
                                <span className={rule.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}>
                                    {rule.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <X size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                    Sign In <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Footer Links */}
            <div className="text-center text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Forgot your password?
                </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; 2024 FitPulse Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};
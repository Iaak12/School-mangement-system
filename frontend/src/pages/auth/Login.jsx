import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, School, Lock, Mail, AlertCircle } from 'lucide-react';
import { authAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/dashboard', { replace: true });
    },
  });

  const onSubmit = (data) => loginMutation.mutate(data);

const demoCredentials = [
  {
    role: "Admin",
    email: "admin@springfield.edu",
    pass: "Admin@1234",
  },
  {
    role: "Principal",
    email: "principal@springfield.edu",
    pass: "Principal@1234",
  },
  {
    role: "Accountant",
    email: "accountant@springfield.edu",
    pass: "Account@1234",
  },
  {
    role: "Librarian",
    email: "librarian@springfield.edu",
    pass: "Library@1234",
  },
  {
    role: "Teacher",
    email: "anita@springfield.edu",
    pass: "Teacher@1234",
  },
  {
    role: "Student",
    email: "student1@springfield.edu",
    pass: "Student@1234",
  },
  {
    role: "Parent",
    email: "parent1@springfield.edu",
    pass: "Parent@1234",
  },
];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 100}px`, height: `${(i + 1) * 100}px`,
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%)`,
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-sm">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Springfield ERP</h1>
          <p className="text-white/80 text-lg mb-8">Complete School Management System</p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[
              { label: '1200+', sub: 'Students' },
              { label: '80+', sub: 'Teachers' },
              { label: '25+', sub: 'Modules' },
              { label: '7', sub: 'User Roles' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.label}</p>
                <p className="text-white/70 text-sm">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Springfield ERP</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your school account</p>
          </div>

          {/* Error */}
          {loginMutation.isError && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {loginMutation.error?.response?.data?.message || 'Invalid credentials. Please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@school.edu"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all',
                    'placeholder:text-muted-foreground',
                    'focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    errors.email ? 'border-red-400' : 'border-border'
                  )}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={cn(
                    'w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-foreground text-sm outline-none transition-all',
                    'placeholder:text-muted-foreground',
                    'focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    errors.password ? 'border-red-400' : 'border-border'
                  )}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-white gradient-primary shadow-lg shadow-primary/30',
                'hover:opacity-90 active:scale-95 transition-all duration-150',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-accent/50 rounded-xl border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Demo Credentials</p>
            <div className="space-y-1.5">
              {demoCredentials.map((c) => (
                <div key={c.role} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground w-16">{c.role}</span>
                  <span className="text-muted-foreground flex-1 truncate">{c.email}</span>
                  <code className="text-primary ml-2 font-mono">{c.pass}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

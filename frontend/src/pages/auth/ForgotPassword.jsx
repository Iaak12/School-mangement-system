import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, School, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api';
import { cn } from '../../lib/utils';

const schema = z.object({ email: z.string().email('Invalid email') });

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ email }) => authAPI.forgotPassword(email),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Springfield ERP</h1>
        </div>

        {mutation.isSuccess ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Email sent!</h2>
            <p className="text-muted-foreground mb-6">Check your inbox for the password reset link. It expires in 10 minutes.</p>
            <Link to="/login" className="text-primary hover:underline text-sm">← Back to login</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Forgot password?</h2>
              <p className="text-muted-foreground">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="your@email.com"
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm outline-none transition-all',
                      'focus:ring-2 focus:ring-primary/30 focus:border-primary',
                      errors.email ? 'border-red-400' : 'border-border'
                    )}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 rounded-xl font-semibold text-white gradient-primary shadow-lg disabled:opacity-60"
              >
                {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3 h-3" /> Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

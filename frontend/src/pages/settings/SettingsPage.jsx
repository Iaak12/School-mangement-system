import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../../api';
import { useForm } from 'react-hook-form';
import { Save, School, Mail, Phone, Globe, MapPin, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.get(),
    select: (r) => r.data.data,
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: settings ? {
      schoolName: settings.schoolName,
      tagline: settings.tagline,
      email: settings.email,
      phone: settings.phone,
      website: settings.website,
      street: settings.address?.street,
      city: settings.address?.city,
      state: settings.address?.state,
      pincode: settings.address?.pincode,
      currentAcademicYear: settings.currentAcademicYear,
    } : {},
  });

  const updateMutation = useMutation({
    mutationFn: (data) => settingsAPI.update({
      schoolName: data.schoolName,
      tagline: data.tagline,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: { street: data.street, city: data.city, state: data.state, pincode: data.pincode },
      currentAcademicYear: data.currentAcademicYear,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const inputClass = cn(
    'w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none transition-all',
    'focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground',
    !isAdmin && 'opacity-60 cursor-not-allowed'
  );

  if (isLoading) return <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">School Settings</h1>
          <p className="page-subtitle">Configure school information and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        {/* School Logo */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><School className="w-4 h-4 text-primary" /> School Identity</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
              {settings?.schoolName?.[0] || 'S'}
            </div>
            {isAdmin && (
              <div>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border hover:border-primary cursor-pointer transition-colors text-sm text-muted-foreground hover:text-primary">
                  <Upload className="w-4 h-4" /> Upload School Logo
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG up to 2MB. Recommended 200×200px</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">School Name</label>
              <input {...register('schoolName')} disabled={!isAdmin} className={inputClass} placeholder="Springfield Public School" />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input {...register('tagline')} disabled={!isAdmin} className={inputClass} placeholder="Excellence in Education" />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select {...register('currentAcademicYear')} disabled={!isAdmin} className={cn(inputClass, 'cursor-pointer')}>
                {['2023-24', '2024-25', '2025-26'].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input {...register('email')} disabled={!isAdmin} className={cn(inputClass, 'pl-10')} placeholder="info@school.edu" /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input {...register('phone')} disabled={!isAdmin} className={cn(inputClass, 'pl-10')} placeholder="+91-9999999999" /></div>
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Website</label>
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input {...register('website')} disabled={!isAdmin} className={cn(inputClass, 'pl-10')} placeholder="https://www.school.edu" /></div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group sm:col-span-2">
              <label className="form-label">Street Address</label>
              <input {...register('street')} disabled={!isAdmin} className={inputClass} placeholder="123 Education Street" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input {...register('city')} disabled={!isAdmin} className={inputClass} placeholder="Springfield" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input {...register('state')} disabled={!isAdmin} className={inputClass} placeholder="Maharashtra" />
            </div>
            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input {...register('pincode')} disabled={!isAdmin} className={inputClass} placeholder="400001" />
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button type="submit" disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;

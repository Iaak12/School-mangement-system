import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { studentsAPI, classesAPI } from '../../api';

const StudentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    admissionNumber: '', // Optional: Controller auto-generates if empty string
    email: '',           // CRITICAL: Required for user generation
    rollNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    aadharNumber: '',
    classId: '',
    sectionId: '',
    academicYear: new Date().getFullYear().toString(),
    status: 'active'
  });
  const [error, setError] = useState('');

  // Fetch classes lookup data
  const { data: classesData } = useQuery({
    queryKey: ['classes', { limit: 100 }],
    queryFn: () => classesAPI.list({ limit: 100 }),
    // FIX 1: Account for envelope formatting. If your class list has pagination, it will be under .classes
    select: (res) => res.data?.data?.classes || res.data?.data || [],
  });

  // Fetch sections dropdown
  const { data: sectionsData } = useQuery({
    queryKey: ['sections', formData.classId],
    queryFn: () => classesAPI.sections(formData.classId),
    enabled: Boolean(formData.classId),
    select: (res) => res.data?.data || [],
  });

  // Profile data hydration
  const { data: existingStudent, isLoading: isHydrating } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsAPI.get(id),
    enabled: isEditMode,
    select: (res) => res.data?.data || res.data,
  });

  useEffect(() => {
    if (existingStudent) {
      setFormData({
        admissionNumber: existingStudent.admissionNumber || '',
        email: existingStudent.user?.email || '', // Safely reads from populated user ref if provided
        rollNumber: existingStudent.rollNumber || '',
        firstName: existingStudent.firstName || '',
        lastName: existingStudent.lastName || '',
        dateOfBirth: existingStudent.dateOfBirth ? new Date(existingStudent.dateOfBirth).toISOString().split('T')[0] : '',
        gender: existingStudent.gender || '',
        bloodGroup: existingStudent.bloodGroup || '',
        aadharNumber: existingStudent.aadharNumber || '',
        classId: existingStudent.class?._id || existingStudent.class || '',
        sectionId: existingStudent.section?._id || existingStudent.section || '',
        academicYear: existingStudent.academicYear || '',
        status: existingStudent.status || 'active',
      });
    }
  }, [existingStudent?._id]);

  const submitMutation = useMutation({
    mutationFn: (data) => {
      // FIX 2: Restructure fields to line up with the controller schema expectations
      const backendPayload = {
        admissionNumber: data.admissionNumber.trim() || undefined, // undefined drops key so controller auto-generates string
        email: data.email, // Sent on root level for destructuring block
        rollNumber: data.rollNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || undefined,
        aadharNumber: data.aadharNumber || undefined,
        class: data.classId || null,
        section: data.sectionId || null,
        academicYear: data.academicYear,
        status: data.status
      };

      return isEditMode ? studentsAPI.update(id, backendPayload) : studentsAPI.create(backendPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      if (isEditMode) queryClient.invalidateQueries({ queryKey: ['student', id] });
      navigate('/students');
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Something went wrong saving student profile.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth || !formData.gender || (!isEditMode && !formData.email.trim())) {
      setError('Please fill in all mandatory parameters.');
      return;
    }
    submitMutation.mutate(formData);
  };

  const isSubmitting = submitMutation.isPending || submitMutation.isLoading;

  if (isHydrating) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/students')} className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">{isEditMode ? 'Edit Student Profile' : 'Register New Student'}</h1>
          <p className="page-subtitle">Configure identification records and base metrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-card border border-border rounded-xl shadow-sm">
        {error && <div className="text-xs p-3 rounded-lg bg-red-50 text-red-600 font-medium">{error}</div>}

        {/* Account Login Email Block */}
        {!isEditMode && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Login / Portal Email Address *</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="name@school.com"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">First Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.firstName}
              onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Last Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.lastName}
              onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Admission Number (Auto-Generated if blank)</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.admissionNumber}
              onChange={(e) => setFormData(p => ({ ...p, admissionNumber: e.target.value }))}
              placeholder="Leave empty for auto generation"
              disabled={isEditMode}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Roll Number</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.rollNumber}
              onChange={(e) => setFormData(p => ({ ...p, rollNumber: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Date of Birth *</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Gender *</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.gender}
              onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
              required
            >
              <option value="">Select Gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Assigned Class</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.classId}
              onChange={(e) => setFormData(p => ({ ...p, classId: e.target.value, sectionId: '' }))}
            >
              <option value="">Select Class...</option>
              {classesData?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Section Slot</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.sectionId}
              disabled={!formData.classId}
              onChange={(e) => setFormData(p => ({ ...p, sectionId: e.target.value }))}
            >
              <option value="">Select Section...</option>
              {sectionsData?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Academic Year *</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.academicYear}
              onChange={(e) => setFormData(p => ({ ...p, academicYear: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Account Status</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.status}
              onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="transferred">Transferred</option>
              <option value="alumni">Alumni</option>
              <option value="expelled">Expelled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={() => navigate('/students')} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-md hover:opacity-90 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Update Record' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentFormPage;
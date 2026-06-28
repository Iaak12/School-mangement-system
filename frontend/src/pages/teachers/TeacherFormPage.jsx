import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { teachersAPI } from '../../api';

const TeacherFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    email: '',           // CRITICAL: Gathered to create the User record backend anchor
    firstName: '',
    lastName: '',
    designation: '',
    department: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  // Hydrate record values if editing an existing instructor profile
  const { data: existingTeacher, isLoading: isHydrating } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teachersAPI.get(id),
    enabled: isEditMode,
    select: (res) => res.data?.data || res.data,
  });

  useEffect(() => {
    if (existingTeacher) {
      setFormData({
        email: existingTeacher.user?.email || '', // Reads safely if populated from User model
        firstName: existingTeacher.firstName || '',
        lastName: existingTeacher.lastName || '',
        designation: existingTeacher.designation || '',
        department: existingTeacher.department || '',
        status: existingTeacher.status || 'active',
      });
    }
  }, [existingTeacher?._id]); // <-- Tracks the safe ID primitive string rather than object reference

  const submitMutation = useMutation({
    mutationFn: (data) => {
      // Structure the exact layout payload expected by the controller destructuring code
      const backendPayload = {
        email: data.email, // Sent on the root level
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        designation: data.designation,
        department: data.department,
        status: data.status
      };

      return isEditMode ? teachersAPI.update(id, backendPayload) : teachersAPI.create(backendPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      if (isEditMode) queryClient.invalidateQueries({ queryKey: ['teacher', id] });
      navigate('/teachers');
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Failed saving instructor data.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || (!isEditMode && !formData.email.trim())) {
      setError('First name, Last name, and Account email are required fields.');
      return;
    }
    submitMutation.mutate(formData);
  };

  const isSubmitting = submitMutation.isPending || submitMutation.isLoading;

  if (isHydrating) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => navigate('/teachers')} 
          className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">{isEditMode ? 'Edit Instructor Details' : 'Hire New Educator'}</h1>
          <p className="page-subtitle">Configure organization structures and workspace anchors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-card border border-border rounded-xl shadow-sm">
        {error && <div className="text-xs p-3 rounded-lg bg-red-50 text-red-600 font-medium">{error}</div>}

        {/* Login Account Provision Anchor (Only collect on initial creation) */}
        {!isEditMode && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Portal / Login Email Address *</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" 
              placeholder="instructor@school.com"
              value={formData.email} 
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} 
              required 
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">First Name *</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Last Name *</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Designation Job Role</label>
          <input type="text" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Senior Lecturer, Assistant Lead Teacher" value={formData.designation} onChange={(e) => setFormData(p => ({ ...p, designation: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Department Office Block</label>
          <input type="text" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Science, Humanities" value={formData.department} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Employment Status</label>
          <select className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}>
            <option value="active">Active/On-Duty</option>
            <option value="inactive">On-Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={() => navigate('/teachers')} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-md hover:opacity-90 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Commit Record Changes' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherFormPage;
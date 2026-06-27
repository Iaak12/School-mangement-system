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
    firstName: '',
    lastName: '',
    rollNumber: '',
    classId: '',
    sectionId: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  // Fetch classes & sections dropdown lookup data
  const { data: classesData } = useQuery({
    queryKey: ['classes', { limit: 100 }],
    queryFn: () => classesAPI.list({ limit: 100 }),
    select: (res) => res.data.data.classes || [],
  });

  // Fetch available sections when a class selection changes
  const { data: sectionsData } = useQuery({
    queryKey: ['sections', formData.classId],
    queryFn: () => classesAPI.sections(formData.classId),
    enabled: Boolean(formData.classId),
    select: (res) => res.data.data || [],
  });

  // Hydrate single record form values if editing
  const { data: existingStudent, isLoading: isHydrating } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsAPI.get(id),
    enabled: isEditMode,
    select: (res) => res.data.data,
  });

  useEffect(() => {
    if (existingStudent) {
      setFormData({
        firstName: existingStudent.firstName || '',
        lastName: existingStudent.lastName || '',
        rollNumber: existingStudent.rollNumber || '',
        classId: existingStudent.class?._id || existingStudent.class || '',
        sectionId: existingStudent.section?._id || existingStudent.section || '',
        status: existingStudent.status || 'active',
      });
    }
  }, [existingStudent]);

  const submitMutation = useMutation({
    mutationFn: (data) => isEditMode ? studentsAPI.update(id, data) : studentsAPI.create(data),
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
    if (!formData.firstName || !formData.lastName) {
      setError('First name and Last name parameters are required.');
      return;
    }
    submitMutation.mutate(formData);
  };

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
        <button onClick={() => navigate('/students')} className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">{isEditMode ? 'Edit Student Profile' : 'Register New Student'}</h1>
          <p className="page-subtitle">Configure identification records and base metrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stat-card p-6 space-y-4 bg-card border border-border rounded-xl">
        {error && <div className="text-xs p-3 rounded-lg bg-red-50 text-red-600 font-medium">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">First Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.firstName}
              onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Last Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.lastName}
              onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
              required
            />
          </div>
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

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Account Lifecycle Status</label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            value={formData.status}
            onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={() => navigate('/students')} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground">Cancel</button>
          <button type="submit" disabled={submitMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-50">
            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Update Record' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentFormPage;
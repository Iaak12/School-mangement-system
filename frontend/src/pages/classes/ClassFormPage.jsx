import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { classesAPI, teachersAPI } from '../../api';

const ClassFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    section: '',
    classTeacherId: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  // Fetch instructors for Class Teacher assigning dropdown list selection
  const { data: teachers } = useQuery({
    queryKey: ['teachers', { limit: 200 }],
    queryFn: () => teachersAPI.list({ limit: 200 }),
    select: (res) => res.data.data.teachers || []
  });

  // Re-fetch individual parameters fallback details if checking active configurations edit
  const { data: currentClass, isLoading: isHydrating } = useQuery({
    queryKey: ['class', id],
    queryFn: () => classesAPI.list({ id }),
    enabled: isEditMode,
    select: (res) => res.data.data.classes?.find(c => c._id === id) || res.data.data
  });

  useEffect(() => {
    if (currentClass) {
      setFormData({
        name: currentClass.name || '',
        section: currentClass.section || '',
        classTeacherId: currentClass.classTeacher?._id || currentClass.classTeacher || '',
        status: currentClass.status || 'active'
      });
    }
  }, [currentClass]);

  const submitMutation = useMutation({
    mutationFn: (data) => isEditMode ? classesAPI.update(id, data) : classesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      navigate('/classes');
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Failure mapping room layout infrastructure data changes.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Core Class descriptor identity name is required.');
      return;
    }
    submitMutation.mutate(formData);
  };

  if (isHydrating) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/classes')} className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="page-title text-xl">{isEditMode ? 'Modify Class Blueprint' : 'Establish New Class Block'}</h1>
          <p className="page-subtitle">Configure naming tracks and point instructors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stat-card p-6 space-y-4 bg-card border border-border rounded-xl">
        {error && <div className="text-xs p-3 rounded-lg bg-red-50 text-red-600 font-medium">{error}</div>}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Class Block Identifier Name</label>
          <input type="text" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Grade 10, Batch A" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Section Identifier Sub-tag</label>
          <input type="text" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. B, Alpha (Optional)" value={formData.section} onChange={(e) => setFormData(p => ({ ...p, section: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Assigned Lead Class Teacher</label>
          <select className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" value={formData.classTeacherId} onChange={(e) => setFormData(p => ({ ...p, classTeacherId: e.target.value }))}>
            <option value="">Choose Teacher...</option>
            {teachers?.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Operational Status</label>
          <select className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}>
            <option value="active">Active Track</option>
            <option value="inactive">Archived/Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={() => navigate('/classes')} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground">Cancel</button>
          <button type="submit" disabled={submitMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90">
            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Commit Structure' : 'Deploy Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassFormPage;
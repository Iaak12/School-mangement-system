import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { parentsAPI } from '../../api';

const ParentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // 1. Initialized standard fields plus our new 'occupation' parameter 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',        // Optional login password
    phone: '',
    relation: 'father', 
    occupation: '', 
    isActive: true
  });
  const [error, setError] = useState('');

  // Fetch baseline configuration if editing an existing profile
  const { data: existingParent, isLoading: isHydrating } = useQuery({
    queryKey: ['parent', id],
    queryFn: () => parentsAPI.get(id),
    enabled: isEditMode,
    select: (res) => res.data.data,
  });

  // 2. Hydrate input layout when data maps down from the API
  useEffect(() => {
    if (existingParent) {
      setFormData({
        firstName: existingParent.firstName || '',
        lastName: existingParent.lastName || '',
        email: existingParent.email || '',
        phone: existingParent.phone || '',
        relation: existingParent.relation || 'father',
        occupation: existingParent.occupation || '', 
        isActive: existingParent.isActive !== false,
      });
    }
  }, [existingParent]);

  // Handle centralized API distribution via mutations
  const submitMutation = useMutation({
    mutationFn: (data) => isEditMode ? parentsAPI.update(id, data) : parentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      if (isEditMode) queryClient.invalidateQueries({ queryKey: ['parent', id] });
      navigate('/parents');
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Error occurred handling baseline parent object configuration details.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phone.trim() ||
      !formData.relation ||
      (!isEditMode && !formData.email.trim())
    ) {
      setError('First name, Last name, Phone, Relation, and Portal Email are required fields.');
      return;
    }
    submitMutation.mutate(formData);
  };

  if (isHydrating) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/parents')} 
          className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">
            {isEditMode ? 'Modify Guardian Record' : 'Create Guardian Core Connection'}
          </h1>
          <p className="page-subtitle">Map emergency parameters and direct outreach contacts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stat-card p-6 space-y-4 bg-card border border-border rounded-xl">
        {error && (
          <div className="text-xs p-3 rounded-lg bg-red-50 text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* First & Last Name row */}
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

        {/* Email Field (Only on creation) */}
        {!isEditMode && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Portal / Login Email Address *</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" 
                placeholder="parent@example.com" 
                value={formData.email} 
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} 
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Portal Password (Optional)</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" 
                placeholder={`Default: Parent@${new Date().getFullYear()}`}
                value={formData.password} 
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} 
              />
            </div>
          </div>
        )}

        {/* Relation & Phone row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Relationship to Student *</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={formData.relation}
              onChange={(e) => setFormData(p => ({ ...p, relation: e.target.value }))}
              required
            >
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Primary Mobile Number *</label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" 
              placeholder="+123 456 7890" 
              value={formData.phone} 
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} 
              required 
            />
          </div>
        </div>

        {/* Occupation Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Occupation / Employment</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" 
            placeholder="Software Engineer, Businessman etc." 
            value={formData.occupation} 
            onChange={(e) => setFormData(p => ({ ...p, occupation: e.target.value }))} 
          />
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-sm text-foreground">Active</span>
        </div>

        {/* Control Actions buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button 
            type="button" 
            onClick={() => navigate('/parents')} 
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitMutation.isPending} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditMode ? (
              'Update Properties'
            ) : (
              'Register Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentFormPage;
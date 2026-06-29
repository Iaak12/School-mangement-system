import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { classesAPI } from '../../api';

const ClassFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    numericName: '',
    description: '',
    academicYear: new Date().getFullYear().toString(),
    isActive: true,
  });
  const [error, setError] = useState('');

  // Fetch all classes, then find the one being edited
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.list(),
    select: (r) => r.data.data,
    enabled: isEditMode,
  });

  // Find the specific class from the list
  const currentClass = isEditMode && classes ? classes.find((c) => c._id === id) : null;

  useEffect(() => {
    if (currentClass) {
      setFormData({
        name: currentClass.name || '',
        numericName: currentClass.numericName || '',
        description: currentClass.description || '',
        academicYear: currentClass.academicYear || new Date().getFullYear().toString(),
        isActive: currentClass.isActive !== false,
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
      setError(err?.response?.data?.message || 'Failed to save class.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Class name is required.');
      return;
    }
    if (!formData.academicYear.trim()) {
      setError('Academic year is required.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      academicYear: formData.academicYear.trim(),
      isActive: formData.isActive,
    };
    if (formData.numericName) {
      payload.numericName = parseInt(formData.numericName, 10);
    }
    submitMutation.mutate(payload);
  };

  if (isEditMode && isLoadingClasses) {
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
          onClick={() => navigate('/classes')}
          className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">{isEditMode ? 'Edit Class' : 'Create New Class'}</h1>
          <p className="page-subtitle text-sm text-muted-foreground">
            {isEditMode ? 'Update class details' : 'Add a new class to the system'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-card border border-border rounded-xl">
        {error && (
          <div className="text-xs p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Class Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Class Name *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Class 1, Grade 10, Nursery"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        {/* Numeric Name (for sorting) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Numeric Order</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. 1, 2, 10 (used for sorting)"
            value={formData.numericName}
            onChange={(e) => setFormData((p) => ({ ...p, numericName: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Optional. Classes are sorted by this number.</p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Description</label>
          <textarea
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            rows={3}
            placeholder="Optional description for this class"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        {/* Academic Year */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Academic Year *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. 2025-2026"
            value={formData.academicYear}
            onChange={(e) => setFormData((p) => ({ ...p, academicYear: e.target.value }))}
            required
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-sm text-foreground">Active</span>
        </div>

        <div className="bg-accent/50 p-3 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Sections (e.g. A, B, C) are managed from the Classes page after creating the class. Each section can have its own class teacher and capacity.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-50"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditMode ? (
              'Update Class'
            ) : (
              'Create Class'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassFormPage;
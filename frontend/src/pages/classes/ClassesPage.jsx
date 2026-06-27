import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { classesAPI } from '../../api';
import { cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const ClassesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' });
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  // Fetch classes data based on query parameters
  const { data, isLoading } = useQuery({
    queryKey: ['classes', params],
    queryFn: () => classesAPI.list(params),
    select: (res) => res.data.data,
  });

  // Handle class profile deletion
  const deleteMutation = useMutation({
    mutationFn: classesAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });

  const classes = data?.classes || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Class Management</h1>
          <p className="page-subtitle">{pagination.total || 0} classes active</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/classes/new')} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search classes…"
          value={params.search}
          onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-32 w-full rounded-xl" />
            </div>
          ))
        ) : classes.map((item) => (
          <div 
            key={item._id} 
            className="stat-card cursor-pointer" 
            onClick={() => navigate(`/classes/${item._id}`)}
          >
            <div className="flex flex-col items-center text-center">
              {/* Class Code/Name Indicator */}
              <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center text-white text-xl font-bold mb-3">
                {item.name?.[0]}{item.section?.[0] || ''}
              </div>
              
              {/* Class Name & Info */}
              <h3 className="font-semibold text-foreground">{item.name} {item.section ? `- ${item.section}` : ''}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Teacher: {item.classTeacher ? `${item.classTeacher.firstName} ${item.classTeacher.lastName}` : 'Assigned Soon'}
              </p>
              
              {/* Student Count Badge */}
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-accent/60 text-muted-foreground rounded-lg text-xs font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{item.studentCount || 0} Students</span>
              </div>
              
              <span className={cn('mt-3 text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(item.status))}>
                {item.status || 'active'}
              </span>
            </div>

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => navigate(`/classes/${item._id}/edit`)} 
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { if (confirm('Delete class configuration?')) deleteMutation.mutate(item._id); }} 
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} 
            className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button 
            disabled={pagination.page >= pagination.pages} 
            onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} 
            className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
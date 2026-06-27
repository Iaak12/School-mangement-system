import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { parentsAPI } from '../../api';
import { cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const ParentsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' });
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  // Fetch parents data based on query parameters
  const { data, isLoading } = useQuery({
    queryKey: ['parents', params],
    queryFn: () => parentsAPI.list(params),
    select: (res) => res.data.data,
  });

  // Handle parent profile deletion
  const deleteMutation = useMutation({
    mutationFn: parentsAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] }),
  });

  const parents = data?.parents || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Parent Management</h1>
          <p className="page-subtitle">{pagination.total || 0} parents registered</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/parents/new')} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Parent
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search parents…"
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
        ) : parents.map((parent) => (
          <div 
            key={parent._id} 
            className="stat-card cursor-pointer" 
            onClick={() => navigate(`/parents/${parent._id}`)}
          >
            <div className="flex flex-col items-center text-center">
              {/* Initial Avatar */}
              <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center text-white text-xl font-bold mb-3">
                {parent.firstName?.[0]}{parent.lastName?.[0]}
              </div>
              
              {/* Parent Info */}
              <h3 className="font-semibold text-foreground">{parent.firstName} {parent.lastName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{parent.email || parent.phone || 'Parent'}</p>
              
              {/* Children Linked Tags */}
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {parent.students?.slice(0, 2).map((student) => (
                  <span 
                    key={student._id} 
                    className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                  >
                    {student.firstName} {student.lastName}
                  </span>
                ))}
                {parent.students?.length > 2 && (
                  <span className="text-[10px] px-2 py-0.5 bg-accent text-muted-foreground rounded-full">
                    +{parent.students.length - 2}
                  </span>
                )}
              </div>
              
              <span className={cn('mt-3 text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(parent.status))}>
                {parent.status}
              </span>
            </div>

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => navigate(`/parents/${parent._id}/edit`)} 
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { if (confirm('Delete parent profile?')) deleteMutation.mutate(parent._id); }} 
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

export default ParentsPage;
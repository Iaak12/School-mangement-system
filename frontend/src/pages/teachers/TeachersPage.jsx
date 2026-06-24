import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { teachersAPI } from '../../api';
import { formatDate, cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const TeachersPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' });
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', params],
    queryFn: () => teachersAPI.list(params),
    select: (res) => res.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: teachersAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  });

  const teachers = data?.teachers || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Management</h1>
          <p className="page-subtitle">{pagination.total || 0} teachers registered</p>
        </div>
        {isAdmin && (
          <button onClick={() => navigate('/teachers/new')} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search teachers…"
          value={params.search}
          onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? Array(8).fill(0).map((_, i) => (
          <div key={i} className="stat-card"><div className="skeleton h-32 w-full rounded-xl" /></div>
        )) : teachers.map((teacher) => (
          <div key={teacher._id} className="stat-card cursor-pointer" onClick={() => navigate(`/teachers/${teacher._id}`)}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center text-white text-xl font-bold mb-3">
                {teacher.firstName?.[0]}{teacher.lastName?.[0]}
              </div>
              <h3 className="font-semibold text-foreground">{teacher.firstName} {teacher.lastName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{teacher.designation || 'Teacher'}</p>
              <p className="text-xs text-muted-foreground">{teacher.department}</p>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {teacher.subjects?.slice(0, 2).map((s) => (
                  <span key={s._id} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{s.name}</span>
                ))}
                {teacher.subjects?.length > 2 && <span className="text-[10px] px-2 py-0.5 bg-accent text-muted-foreground rounded-full">+{teacher.subjects.length - 2}</span>}
              </div>
              <span className={cn('mt-3 text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(teacher.status))}>{teacher.status}</span>
            </div>
            {isAdmin && (
              <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => navigate(`/teachers/${teacher._id}/edit`)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete teacher?')) deleteMutation.mutate(teacher._id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={pagination.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent">Previous</button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button disabled={pagination.page >= pagination.pages} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent">Next</button>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;

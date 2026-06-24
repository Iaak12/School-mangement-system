import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, FileText, Download, BookOpen, CheckCircle } from 'lucide-react';
import { examsAPI, classesAPI } from '../../api';
import { formatDate, cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const ExamsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ academicYear: '2024-25', status: '' });
  const isAdmin = ['admin', 'principal', 'teacher'].includes(user?.role);

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams', params],
    queryFn: () => examsAPI.list(params),
    select: (r) => r.data.data,
  });

  const publishMutation = useMutation({
    mutationFn: examsAPI.publishResults,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const TYPE_COLORS = { 'unit-test': 'gradient-info', midterm: 'gradient-warning', final: 'gradient-primary', 'pre-board': 'gradient-purple', board: 'gradient-danger' };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Examinations</h1>
          <p className="page-subtitle">Manage exams, results, and report cards</p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select value={params.status} onChange={(e) => setParams((p) => ({ ...p, status: e.target.value }))}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Exam Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(exams || []).map((exam, i) => (
            <div key={exam._id} className="stat-card">
              <div className="flex items-start gap-3">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0', TYPE_COLORS[exam.type] || 'gradient-primary')}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{exam.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{exam.type?.replace('-', ' ')} · {exam.class?.name}</p>
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0', getStatusColor(exam.status))}>{exam.status}</span>
              </div>

              <div className="mt-4 space-y-1">
                {exam.schedule?.slice(0, 3).map((s) => (
                  <div key={s._id} className="flex justify-between text-xs text-muted-foreground">
                    <span>{s.subject?.name}</span>
                    <span>{s.date ? formatDate(s.date) : 'TBD'}</span>
                  </div>
                ))}
                {exam.schedule?.length > 3 && <p className="text-xs text-muted-foreground">+{exam.schedule.length - 3} more subjects</p>}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">
                  <Eye className="w-3 h-3" /> Results
                </button>
                {exam.status === 'completed' && isAdmin && (
                  <button onClick={() => publishMutation.mutate(exam._id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg gradient-success text-white text-xs font-medium hover:opacity-90 transition-all">
                    <CheckCircle className="w-3 h-3" /> Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsPage;

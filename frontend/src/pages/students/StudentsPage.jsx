import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Award, ArrowRight, UserCheck } from 'lucide-react';
import { studentsAPI, classesAPI } from '../../api';
import { formatDate, cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const GENDER_COLORS = { male: 'text-blue-600 bg-blue-50', female: 'text-pink-600 bg-pink-50', other: 'text-purple-600 bg-purple-50' };

const StudentsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '', classId: '', gender: '' });
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = ['admin', 'principal'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsAPI.list(params),
    select: (res) => res.data.data,
  });

  const { data: classData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.list(),
    select: (res) => res.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: studentsAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  const exportExcel = async () => {
    const res = await studentsAPI.exportExcel(params);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'students.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  const students = data?.students || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">{pagination.total || 0} students enrolled</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={() => navigate('/students/new')} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Search by name, admission number…"
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors', showFilters ? 'bg-primary text-white border-primary' : 'border-border bg-card hover:bg-accent')}>
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-accent/50 rounded-xl border border-border animate-fade-in">
          <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none" value={params.classId} onChange={(e) => setParams((p) => ({ ...p, classId: e.target.value, page: 1 }))}>
            <option value="">All Classes</option>
            {(classData || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none" value={params.status} onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
            <option value="alumni">Alumni</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none" value={params.gender} onChange={(e) => setParams((p) => ({ ...p, gender: e.target.value, page: 1 }))}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Admission No</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Class</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Gender</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Admission Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No students found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : students.map((student) => (
                <tr key={student._id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => navigate(`/students/${student._id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground">Roll: {student.rollNumber || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{student.admissionNumber}</td>
                  <td className="px-4 py-3 text-foreground">{student.class?.name} - {student.section?.name}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', GENDER_COLORS[student.gender] || '')}>{student.gender}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(student.admissionDate)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(student.status))}>{student.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/students/${student._id}`)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => navigate(`/students/${student._id}/edit`)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('Delete this student?')) deleteMutation.mutate(student._id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} – {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={pagination.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">Previous</button>
              <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;

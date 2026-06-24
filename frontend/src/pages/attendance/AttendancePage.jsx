import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { attendanceAPI, classesAPI } from '../../api';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { CheckCircle, XCircle, Clock, AlertCircle, Save, Download } from 'lucide-react';

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  absent: { label: 'Absent', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  late: { label: 'Late', color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  leave: { label: 'Leave', color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  'half-day': { label: 'Half Day', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
};

const AttendancePage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isTeacher = ['teacher', 'admin', 'principal'].includes(user?.role);

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [records, setRecords] = useState({});

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classesAPI.list(), select: (r) => r.data.data });
  const { data: sections } = useQuery({ queryKey: ['sections', selectedClass], queryFn: () => classesAPI.sections(selectedClass), select: (r) => r.data.data, enabled: !!selectedClass });

  const { data: attData, isLoading } = useQuery({
    queryKey: ['attendance', { date: selectedDate, classId: selectedClass, sectionId: selectedSection }],
    queryFn: () => attendanceAPI.get({ date: selectedDate, classId: selectedClass, sectionId: selectedSection }),
    select: (r) => r.data.data,
    enabled: !!selectedClass && !!selectedSection,
    onSuccess: (data) => {
      if (data?.attendance) {
        const map = {};
        data.attendance.records.forEach((r) => { map[r.student._id] = r.status; });
        setRecords(map);
      } else if (data?.students) {
        const map = {};
        data.students.forEach((s) => { map[s._id] = 'present'; });
        setRecords(map);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => attendanceAPI.mark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      alert('Attendance saved successfully!');
    },
  });

  const students = attData?.attendance?.records?.map((r) => r.student) || attData?.students || [];
  const stats = { present: 0, absent: 0, late: 0, leave: 0 };
  Object.values(records).forEach((s) => { if (stats[s] !== undefined) stats[s]++; });

  const handleSave = () => {
    const recordsList = students.map((s) => ({ student: s._id, status: records[s._id] || 'present' }));
    saveMutation.mutate({ date: selectedDate, classId: selectedClass, sectionId: selectedSection, records: recordsList, academicYear: '2024-25' });
  };

  const exportExcel = async () => {
    const [month, year] = [new Date(selectedDate).getMonth() + 1, new Date(selectedDate).getFullYear()];
    const res = await attendanceAPI.exportExcel({ classId: selectedClass, sectionId: selectedSection, month, year });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'attendance.xlsx'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Mark and track daily attendance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent">
            <Download className="w-4 h-4" /> Export
          </button>
          {isTeacher && (
            <button onClick={handleSave} disabled={!selectedClass || !selectedSection || saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg disabled:opacity-60">
              <Save className="w-4 h-4" /> {saveMutation.isPending ? 'Saving…' : 'Save Attendance'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={today}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Select Class</option>
          {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
          <option value="">Select Section</option>
          {(sections || []).map((s) => <option key={s._id} value={s._id}>Section {s.name}</option>)}
        </select>
      </div>

      {/* Stats */}
      {selectedClass && selectedSection && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} className={cn('p-4 rounded-xl border text-center', cfg.color)}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium mt-0.5">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Attendance Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array(10).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : !selectedClass || !selectedSection ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select class and section to view attendance</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No students found in this class/section</div>
      ) : (
        <div className="data-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Roll No</th>
                  {Object.keys(STATUS_CONFIG).map((s) => (
                    <th key={s} className="text-center px-3 py-3 font-semibold text-muted-foreground">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs', STATUS_CONFIG[s].color)}>{STATUS_CONFIG[s].label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </div>
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{student.rollNumber || '-'}</td>
                    {Object.keys(STATUS_CONFIG).map((status) => (
                      <td key={status} className="px-3 py-3 text-center">
                        <button
                          onClick={() => isTeacher && setRecords((r) => ({ ...r, [student._id]: status }))}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all duration-150 mx-auto flex items-center justify-center',
                            records[student._id] === status ? STATUS_CONFIG[status].color + ' border-current scale-110' : 'border-border hover:border-gray-400 opacity-40',
                            isTeacher ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                          )}
                        >
                          {records[student._id] === status && <CheckCircle className="w-3 h-3" />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;

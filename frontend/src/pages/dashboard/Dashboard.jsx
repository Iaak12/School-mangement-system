import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { dashboardAPI } from '../../api';
import { formatDate } from '../../lib/utils';
import AdminDashboard from './AdminDashboard';

// ── Teacher Dashboard ─────────────────────────────────────────────
const TeacherDashboard = () => {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: () => dashboardAPI.teacher(),
    select: (r) => r.data.data,
  });

  const statItems = [
    { label: 'My Classes', value: data?.teacher?.classes?.length ?? 0, sub: 'Assigned classes', color: 'gradient-primary' },
    { label: 'My Subjects', value: data?.teacher?.subjects?.length ?? 0, sub: 'Teaching subjects', color: 'gradient-success' },
    { label: 'Homework', value: data?.upcomingHomework?.length ?? 0, sub: 'Pending assignments', color: 'gradient-warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Dashboard</h1>
          <p className="page-subtitle">Welcome back, <span className="text-primary font-semibold">{user?.name}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statItems.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white text-xl font-bold`}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.upcomingHomework?.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold mb-4">Upcoming Homework</h3>
          <div className="space-y-2">
            {data.upcomingHomework.map((hw) => (
              <div key={hw._id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{hw.title}</p>
                  <p className="text-xs text-muted-foreground">{hw.subject?.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">Due: {formatDate(hw.dueDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.recentNotices?.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold mb-4">Recent Notices</h3>
          <div className="space-y-2">
            {data.recentNotices.map((n) => (
              <div key={n._id} className="p-3 rounded-lg bg-accent/50">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Student Dashboard ─────────────────────────────────────────────
const StudentDashboard = () => {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: () => dashboardAPI.student(),
    select: (r) => r.data.data,
  });

  const statItems = [
    { label: 'Attendance', value: `${data?.attendancePercentage ?? 0}%`, color: data?.attendancePercentage >= 75 ? 'gradient-success' : 'gradient-warning' },
    { label: 'Homework Due', value: data?.upcomingHomework?.length ?? 0, color: 'gradient-warning' },
    { label: 'Pending Fees', value: data?.pendingPayments?.length ?? 0, color: data?.pendingPayments?.length ? 'gradient-danger' : 'gradient-success' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Welcome, <span className="text-primary font-semibold">{user?.name}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statItems.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white text-2xl font-bold`}>
                {String(s.value)[0]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.upcomingHomework?.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold mb-4">Upcoming Homework</h3>
          <div className="space-y-2">
            {data.upcomingHomework.map((hw) => (
              <div key={hw._id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium">{hw.title}</p>
                  <p className="text-xs text-muted-foreground">{hw.subject?.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(hw.dueDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.recentNotices?.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold mb-4">Recent Notices</h3>
          <div className="space-y-2">
            {data.recentNotices.map((n) => (
              <div key={n._id} className="p-3 rounded-lg bg-accent/50">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Parent Dashboard ──────────────────────────────────────────────
const ParentDashboard = () => {
  const { data } = useQuery({
    queryKey: ['dashboard', 'parent'],
    queryFn: () => dashboardAPI.parent(),
    select: (r) => r.data.data,
  });

  const children = data?.childrenData || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parent Dashboard</h1>
          <p className="page-subtitle">Monitor your children's progress</p>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No children linked to your account.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map(({ student, pendingFees, recentHomework }) => (
            <div key={student._id} className="chart-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  {student.firstName?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{student.firstName} {student.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{student.class?.name} – Section {student.section?.name}</p>
                </div>
                {pendingFees?.length > 0 && (
                  <span className="text-xs px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium">
                    {pendingFees.length} Fee{pendingFees.length > 1 ? 's' : ''} Pending
                  </span>
                )}
              </div>

              {recentHomework?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Upcoming Homework</p>
                  <div className="space-y-1.5">
                    {recentHomework.slice(0, 3).map((hw) => (
                      <div key={hw._id} className="flex justify-between items-center text-xs text-muted-foreground p-2 rounded-lg bg-accent/50">
                        <span className="font-medium text-foreground">{hw.title}</span>
                        <span>{formatDate(hw.dueDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data?.recentNotices?.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold mb-4">Recent Notices</h3>
          <div className="space-y-2">
            {data.recentNotices.map((n) => (
              <div key={n._id} className="p-3 rounded-lg bg-accent/50">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Accountant / Librarian Dashboard (reuse Admin) ────────────────
const SimpleDashboard = () => {
  const { user } = useAuthStore();
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome, <span className="text-primary font-semibold">{user?.name}</span> · <span className="capitalize">{user?.role}</span></p>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard Router ─────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'student') return <StudentDashboard />;
  if (role === 'parent') return <ParentDashboard />;
  if (role === 'principal' || role === 'admin' || role === 'accountant') return <AdminDashboard />;
  return <SimpleDashboard />;
};

export default Dashboard;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, GraduationCap, UserCheck, BookOpen, DollarSign,
  TrendingUp, AlertCircle, Calendar, ChevronRight, Clock,
} from 'lucide-react';
import { dashboardAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#8b5cf6'];

const StatCard = ({ title, value, sub, icon: Icon, gradient, trend }) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className={cn('stat-card-icon', gradient)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
        <TrendingUp className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
        {Math.abs(trend)}% vs last month
      </div>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="stat-card">
    <div className="flex justify-between">
      <div className="space-y-2">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-16" />
        <div className="skeleton h-3 w-32" />
      </div>
      <div className="skeleton w-12 h-12 rounded-xl" />
    </div>
  </div>
);

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardAPI.admin(),
    select: (res) => res.data.data,
    staleTime: 60000,
  });

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const upcomingExams = data?.upcomingExams || [];
  const recentNotices = data?.recentNotices || [];

  const feesTrend = (charts.monthlyFeesTrend || []).map((item) => ({
    month: monthNames[(item._id.month || 1) - 1],
    amount: item.total || 0,
  }));

  const studentGrowth = (charts.studentGrowth || []).map((item) => ({
    month: monthNames[(item._id.month || 1) - 1],
    students: item.count || 0,
  }));

  const attendancePie = [
    { name: 'Present', value: stats.attendancePercentage || 0 },
    { name: 'Absent', value: 100 - (stats.attendancePercentage || 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <span className="font-semibold text-primary">{user?.name}</span> · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          Academic Year: 2024-25
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Students" value={stats.totalStudents?.toLocaleString() || '0'} sub="Active enrollments" icon={GraduationCap} gradient="gradient-primary" trend={5.2} />
            <StatCard title="Total Teachers" value={stats.totalTeachers?.toLocaleString() || '0'} sub="Teaching staff" icon={UserCheck} gradient="gradient-success" trend={2.1} />
            <StatCard title="Total Parents" value={stats.totalParents?.toLocaleString() || '0'} sub="Registered parents" icon={Users} gradient="gradient-info" />
            <StatCard title="Attendance Today" value={`${stats.attendancePercentage || 0}%`} sub="Present today" icon={BookOpen} gradient={stats.attendancePercentage >= 75 ? 'gradient-success' : 'gradient-warning'} />
            <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} sub="This month's collection" icon={DollarSign} gradient="gradient-success" trend={8.4} />
            <StatCard title="Pending Fees" value={formatCurrency(stats.pendingFees)} sub="Outstanding dues" icon={AlertCircle} gradient="gradient-danger" />
            <StatCard title="Upcoming Exams" value={stats.upcomingExamsCount || '0'} sub="Scheduled exams" icon={Calendar} gradient="gradient-warning" />
            <StatCard title="Active Classes" value="24" sub="12 classes × 2 sections" icon={BookOpen} gradient="gradient-purple" />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Trend */}
        <div className="chart-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Fee Collection Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly collection overview</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">2024-25</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={feesTrend}>
              <defs>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Collected']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fill="url(#feeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Pie */}
        <div className="chart-card">
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Today's Attendance</h3>
            <p className="text-sm text-muted-foreground">Present vs Absent</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value">
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Present ({stats.attendancePercentage}%)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Absent ({100 - stats.attendancePercentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth */}
        <div className="chart-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Student Admissions</h3>
              <p className="text-sm text-muted-foreground">Monthly growth trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Exams */}
        <div className="chart-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Upcoming Exams</h3>
            <a href="/exams" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></a>
          </div>
          <div className="space-y-3">
            {upcomingExams.length > 0 ? upcomingExams.map((exam, i) => (
              <div key={exam._id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                  ['gradient-primary', 'gradient-warning', 'gradient-success'][i % 3]
                )}>
                  {exam.class?.name?.replace('Class ', '') || i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{exam.name}</p>
                  <p className="text-xs text-muted-foreground">{exam.class?.name} · {exam.type}</p>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {exam.schedule?.[0]?.date ? formatDate(exam.schedule[0].date) : 'TBD'}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No upcoming exams</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="chart-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Notices</h3>
          <a href="/notices" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentNotices.map((notice) => {
            const catColors = { urgent: 'border-red-400 bg-red-50 dark:bg-red-900/20', exam: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20', fee: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20', general: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' };
            return (
              <div key={notice._id} className={cn('p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-sm transition-all', catColors[notice.category] || catColors.general)}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{notice.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-muted-foreground capitalize flex-shrink-0">{notice.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(notice.publishDate)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

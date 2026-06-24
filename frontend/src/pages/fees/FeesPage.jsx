import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesAPI } from '../../api';
import { formatCurrency, formatDate, getStatusColor, cn } from '../../lib/utils';
import { DollarSign, Download, AlertTriangle, TrendingUp, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FeesPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('payments');

  const { data: paymentsData } = useQuery({
    queryKey: ['payments'],
    queryFn: () => feesAPI.getPayments({ limit: 20 }),
    select: (r) => r.data.data,
  });

  const { data: stats } = useQuery({
    queryKey: ['fee-stats'],
    queryFn: () => feesAPI.getStats({ academicYear: '2024-25' }),
    select: (r) => r.data.data,
  });

  const { data: defaulters } = useQuery({
    queryKey: ['defaulters'],
    queryFn: () => feesAPI.getDefaulters({ academicYear: '2024-25' }),
    select: (r) => r.data.data,
    enabled: tab === 'defaulters',
  });

  const downloadReceipt = async (paymentId, receiptNumber) => {
    const res = await feesAPI.downloadReceipt(paymentId);
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(url);
  };

  const payments = paymentsData?.payments || [];
  const monthlyTrend = (stats?.monthlyTrend || []).map((item) => ({
    month: new Date(2024, (item._id.month || 1) - 1).toLocaleString('en', { month: 'short' }),
    amount: item.total || 0,
    count: item.count || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Track collections, defaulters, and receipts</p>
        </div>
        <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg">
          <DollarSign className="w-4 h-4" /> Collect Fee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats?.totalCollected)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Pending Fees</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats?.pending)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-danger flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-white" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(monthlyTrend[monthlyTrend.length - 1]?.amount)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {monthlyTrend.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold mb-4">Fee Collection Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Collected']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-accent/50 rounded-xl w-fit">
        {['payments', 'defaulters'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors', tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {tab === 'payments' && (
        <div className="data-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Receipt No</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Month</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Method</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.receiptNumber}</td>
                    <td className="px-4 py-3 font-medium">{p.student?.firstName} {p.student?.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.month || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(p.totalAmount)}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.paymentMethod}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.paidDate)}</td>
                    <td className="px-4 py-3"><span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(p.status))}>{p.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => downloadReceipt(p._id, p.receiptNumber)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Download Receipt">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Defaulters */}
      {tab === 'defaulters' && (
        <div className="data-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Class</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Pending Month</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Paid Months</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(defaulters || []).map((d) => (
                  <tr key={d.student._id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.student.firstName} {d.student.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.student.class?.name}</td>
                    <td className="px-4 py-3"><span className="badge-overdue text-xs px-2.5 py-1 rounded-full font-medium">{d.pendingMonth}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{d.paidMonths.join(', ') || 'None'}</td>
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

export default FeesPage;

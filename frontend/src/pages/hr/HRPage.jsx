import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAPI } from '../../api';
import { Plus, Briefcase, DollarSign, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, cn, getStatusColor } from '../../lib/utils';

const HRPage = () => {
  const [tab, setTab] = useState('staff');
  const queryClient = useQueryClient();
  const [payrollFilter, setPayrollFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['hr-staff'],
    queryFn: () => hrAPI.staff(),
    select: (r) => r.data.data.staff,
    enabled: tab === 'staff',
  });

  const { data: payroll, isLoading: payrollLoading } = useQuery({
    queryKey: ['hr-payroll', payrollFilter],
    queryFn: () => hrAPI.payroll(payrollFilter),
    select: (r) => r.data.data,
    enabled: tab === 'payroll',
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id }) => hrAPI.markPaid(id, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr-payroll'] }),
  });

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">HR & Payroll</h1>
          <p className="page-subtitle">Staff management and salary processing</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90">
          <Plus className="w-4 h-4" /> {tab === 'staff' ? 'Add Staff' : 'Generate Payroll'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-accent/50 rounded-xl w-fit">
        {['staff', 'payroll'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors', tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      {tab === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {staffLoading ? Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />) :
            (staff || []).map((s) => (
              <div key={s._id} className="stat-card text-center">
                <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {s.firstName?.[0]}{s.lastName?.[0]}
                </div>
                <h3 className="font-semibold text-foreground">{s.firstName} {s.lastName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{s.designation}</p>
                <p className="text-xs text-muted-foreground">{s.department}</p>
                <p className="text-sm font-semibold text-green-600 mt-2">{formatCurrency(s.salary)}/mo</p>
                <span className={cn('mt-2 inline-block text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(s.status))}>{s.status}</span>
              </div>
            ))
          }
          {(!staff || staff.length === 0) && !staffLoading && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No staff found</p>
            </div>
          )}
        </div>
      )}

      {/* Payroll Table */}
      {tab === 'payroll' && (
        <>
          <div className="flex gap-3">
            <select value={payrollFilter.month} onChange={(e) => setPayrollFilter((p) => ({ ...p, month: Number(e.target.value) }))}
              className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={payrollFilter.year} onChange={(e) => setPayrollFilter((p) => ({ ...p, year: Number(e.target.value) }))}
              className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="data-table-wrapper">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-accent/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Employee</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Designation</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Basic</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Deductions</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Net Salary</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payrollLoading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>)}</tr>
                  )) : (payroll || []).map((p) => (
                    <tr key={p._id} className="hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-white text-xs font-bold">
                            {p.staff?.firstName?.[0]}{p.staff?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">{p.staff?.firstName} {p.staff?.lastName}</p>
                            <p className="text-xs text-muted-foreground">{p.staff?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.staff?.designation}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(p.basicSalary)}</td>
                      <td className="px-4 py-3 text-red-500">-{formatCurrency(p.totalDeductions)}</td>
                      <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(p.netSalary)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', p.status === 'paid' ? 'badge-active' : 'badge-pending')}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.status !== 'paid' && (
                          <button onClick={() => markPaidMutation.mutate({ id: p._id })} disabled={markPaidMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-success text-white text-xs font-medium ml-auto hover:opacity-90">
                            <CheckCircle className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!payroll || payroll.length === 0) && !payrollLoading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>No payroll records for this period</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HRPage;

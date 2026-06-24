import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { noticesAPI } from '../../api';
import { formatDate, cn } from '../../lib/utils';
import { Bell, Plus, Pin, Tag } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const CATEGORY_COLORS = {
  general: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20',
  exam: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20',
  fee: 'bg-orange-50 border-orange-300 dark:bg-orange-900/20',
  holiday: 'bg-green-50 border-green-300 dark:bg-green-900/20',
  event: 'bg-purple-50 border-purple-300 dark:bg-purple-900/20',
  urgent: 'bg-red-50 border-red-300 dark:bg-red-900/20',
};

const NoticeBoardPage = () => {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const isAdmin = ['admin', 'principal', 'teacher'].includes(user?.role);

  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices', { search, category }],
    queryFn: () => noticesAPI.list({ search, category, limit: 50 }),
    select: (r) => r.data.data,
  });

  const pinned = (notices?.notices || []).filter((n) => n.isPinned);
  const regular = (notices?.notices || []).filter((n) => !n.isPinned);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-subtitle">School announcements and updates</p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90">
            <Plus className="w-4 h-4" /> Post Notice
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search notices…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">All Categories</option>
          {Object.keys(CATEGORY_COLORS).map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Pinned Notices */}
      {pinned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Pinned</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinned.map((n) => (
              <div key={n._id} className={cn('p-5 rounded-xl border-l-4 border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer', CATEGORY_COLORS[n.category])}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">{n.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-primary text-white rounded-full flex-shrink-0 capitalize">{n.category}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{n.content}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{n.createdBy?.name}</span>
                  <span>{formatDate(n.publishDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notices */}
      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {regular.map((n) => (
            <div key={n._id} className={cn('p-5 rounded-xl border-l-4 border border-border bg-card hover:shadow-sm transition-all cursor-pointer flex gap-4', CATEGORY_COLORS[n.category])}>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{n.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.priority === 'high' && <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Urgent</span>}
                    <span className="text-[10px] px-2 py-0.5 bg-accent text-muted-foreground rounded-full capitalize">{n.category}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>By {n.createdBy?.name}</span>
                  <span>·</span>
                  <span>{formatDate(n.publishDate)}</span>
                  {n.targetAudience && <span>· For: {n.targetAudience.join(', ')}</span>}
                </div>
              </div>
            </div>
          ))}
          {regular.length === 0 && !isLoading && (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notices found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoticeBoardPage;

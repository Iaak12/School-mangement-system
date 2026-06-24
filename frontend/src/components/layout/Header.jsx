import React, { useState } from 'react';
import { Menu, Bell, Moon, Sun, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import useDarkMode from '../../hooks/useDarkMode';
import { noticesAPI } from '../../api';
import { getInitials, formatDateTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

const Header = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { toggleTheme, isDark } = useDarkMode();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notifData } = useQuery({
    queryKey: ['notifications', { isRead: false }],
    queryFn: () => noticesAPI.notifications({ limit: 10 }),
    select: (res) => res.data.data,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[260px] z-40 h-16 bg-card/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3"
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className={cn(
        'flex-1 max-w-md hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background transition-all',
        showSearch && 'ring-2 ring-primary/30'
      )}>
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          placeholder="Search students, teachers, fees…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSearch(true)}
          onBlur={() => setShowSearch(false)}
        />
      </div>

      <div className="flex-1 sm:flex-none" />

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          title="Toggle dark mode"
        >
          {isDark() ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-ring">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button
                  onClick={() => { noticesAPI.markAllRead(); setShowNotifications(false); }}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifData?.notifications?.length > 0 ? (
                  notifData.notifications.map((n) => (
                    <div key={n._id} className={cn('px-4 py-3 hover:bg-accent cursor-pointer transition-colors', !n.isRead && 'bg-primary/5')}>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">No notifications</div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button onClick={() => { navigate('/notices'); setShowNotifications(false); }} className="text-xs text-primary hover:underline w-full text-center">
                  View all notices
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors hidden sm:flex"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User avatar */}
        <div className="ml-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer" title={user?.name}>
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Header;

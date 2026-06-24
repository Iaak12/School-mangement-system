import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, BookOpen,
  ClipboardList, DollarSign, FileText, Bell, MessageSquare,
  Library, Bus, Briefcase, FolderOpen, Settings, ChevronDown,
  ChevronRight, School, LogOut, Menu, X, TrendingUp,
  Calendar, BookMarked, UserCog,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cn, getInitials } from '../../lib/utils';
import { authAPI } from '../../api';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../hooks/useToast';

const navConfig = {
  principal: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Students', icon: GraduationCap, path: '/students' },
    { label: 'Teachers', icon: UserCheck, path: '/teachers' },
    { label: 'Parents', icon: Users, path: '/parents' },
    { label: 'Classes', icon: BookOpen, path: '/classes' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Fee Management', icon: DollarSign, path: '/fees' },
    { label: 'Examinations', icon: FileText, path: '/exams' },
    { label: 'Homework', icon: BookMarked, path: '/homework' },
    { label: 'Timetable', icon: Calendar, path: '/timetable' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
    { label: 'Library', icon: Library, path: '/library' },
    { label: 'Transport', icon: Bus, path: '/transport' },
    { label: 'HR & Payroll', icon: Briefcase, path: '/hr' },
    { label: 'Documents', icon: FolderOpen, path: '/documents' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Students', icon: GraduationCap, path: '/students' },
    { label: 'Teachers', icon: UserCheck, path: '/teachers' },
    { label: 'Parents', icon: Users, path: '/parents' },
    { label: 'Classes', icon: BookOpen, path: '/classes' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Fee Management', icon: DollarSign, path: '/fees' },
    { label: 'Examinations', icon: FileText, path: '/exams' },
    { label: 'Homework', icon: BookMarked, path: '/homework' },
    { label: 'Timetable', icon: Calendar, path: '/timetable' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
    { label: 'Library', icon: Library, path: '/library' },
    { label: 'Transport', icon: Bus, path: '/transport' },
    { label: 'HR & Payroll', icon: Briefcase, path: '/hr' },
    { label: 'Documents', icon: FolderOpen, path: '/documents' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Students', icon: GraduationCap, path: '/students' },
    { label: 'Homework', icon: BookMarked, path: '/homework' },
    { label: 'Examinations', icon: FileText, path: '/exams' },
    { label: 'Timetable', icon: Calendar, path: '/timetable' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
    { label: 'Library', icon: Library, path: '/library' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Homework', icon: BookMarked, path: '/homework' },
    { label: 'Examinations', icon: FileText, path: '/exams' },
    { label: 'Timetable', icon: Calendar, path: '/timetable' },
    { label: 'Fee Details', icon: DollarSign, path: '/fees' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
    { label: 'Library', icon: Library, path: '/library' },
  ],
  parent: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance', icon: ClipboardList, path: '/attendance' },
    { label: 'Results', icon: TrendingUp, path: '/exams' },
    { label: 'Homework', icon: BookMarked, path: '/homework' },
    { label: 'Fee Details', icon: DollarSign, path: '/fees' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
  ],
  accountant: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Fee Management', icon: DollarSign, path: '/fees' },
    { label: 'HR & Payroll', icon: Briefcase, path: '/hr' },
    { label: 'Students', icon: GraduationCap, path: '/students' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
  ],
  librarian: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Library', icon: Library, path: '/library' },
    { label: 'Students', icon: GraduationCap, path: '/students' },
    { label: 'Notice Board', icon: Bell, path: '/notices' },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = user?.role || 'admin';
  const navItems = navConfig[role] || navConfig.admin;

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: () => {
      logout();
      navigate('/login');
    },
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-transform duration-300 shadow-xl',
          'w-[260px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo / School Name */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm leading-tight">Springfield ERP</h1>
              <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-accent text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn('nav-item group', isActive && 'active')
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-accent/50 mb-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

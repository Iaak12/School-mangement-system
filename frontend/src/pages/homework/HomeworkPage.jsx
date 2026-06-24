import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Clock, BookOpen, Upload, CheckCircle, Eye } from 'lucide-react';
import { homeworkAPI } from '../../api';
import { formatDate, cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const HomeworkPage = () => {
  const { user } = useAuthStore();
  const isTeacher = ['teacher', 'admin', 'principal'].includes(user?.role);
  const isStudent = user?.role === 'student';

  const { data: homework, isLoading } = useQuery({
    queryKey: ['homework'],
    queryFn: () => homeworkAPI.list({ status: 'active' }),
    select: (r) => r.data.data,
  });

  const isPastDue = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Homework</h1>
          <p className="page-subtitle">{isTeacher ? 'Create and manage homework assignments' : 'View and submit homework'}</p>
        </div>
        {isTeacher && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90">
            <Plus className="w-4 h-4" /> Create Homework
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(homework || []).map((hw) => {
            const overdue = isPastDue(hw.dueDate);
            return (
              <div key={hw._id} className={cn('stat-card', overdue && 'border-red-200 dark:border-red-800')}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-info flex items-center justify-center text-white flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-2">{hw.title}</h3>
                    <p className="text-xs text-primary mt-0.5">{hw.subject?.name}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{hw.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: <span className={cn('font-medium ml-0.5', overdue ? 'text-red-500' : 'text-foreground')}>{formatDate(hw.dueDate)}</span>
                  </span>
                  {hw.maxMarks && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {hw.maxMarks} marks</span>}
                </div>

                {hw.attachments?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Upload className="w-3 h-3" />
                    {hw.attachments.length} attachment{hw.attachments.length > 1 ? 's' : ''}
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  {isStudent && !overdue && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg gradient-primary text-white text-xs font-medium hover:opacity-90">
                      <Upload className="w-3 h-3" /> Submit
                    </button>
                  )}
                  {isTeacher && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">
                      <Eye className="w-3 h-3" /> Submissions
                    </button>
                  )}
                  {overdue && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Past due date</span>}
                </div>
              </div>
            );
          })}

          {(!homework || homework.length === 0) && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No homework found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeworkPage;

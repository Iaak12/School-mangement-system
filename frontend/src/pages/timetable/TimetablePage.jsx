import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timetableAPI, classesAPI } from '../../api';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_COLORS = ['gradient-primary', 'gradient-success', 'gradient-warning', 'gradient-info', 'gradient-danger', 'gradient-purple'];

const TimetablePage = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classesAPI.list(), select: (r) => r.data.data });
  const { data: sections } = useQuery({ queryKey: ['sections', selectedClass], queryFn: () => classesAPI.sections(selectedClass), select: (r) => r.data.data, enabled: !!selectedClass });

  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable', selectedClass, selectedSection],
    queryFn: () => timetableAPI.get({ classId: selectedClass, sectionId: selectedSection }),
    select: (r) => r.data.data,
    enabled: !!selectedClass && !!selectedSection,
  });

  const scheduleByDay = {};
  (timetable?.schedule || []).forEach((entry) => {
    if (!scheduleByDay[entry.day]) scheduleByDay[entry.day] = [];
    scheduleByDay[entry.day].push(entry);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Timetable</h1>
          <p className="page-subtitle">Class schedule and period management</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Timetable Grid */}
      {!selectedClass || !selectedSection ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select class and section to view timetable</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : !timetable ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No timetable set for this class</p>
        </div>
      ) : (
        <div className="space-y-3">
          {DAYS.map((day) => {
            const periods = scheduleByDay[day.toLowerCase()] || [];
            return (
              <div key={day} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 bg-accent/50 border-b border-border">
                  <h3 className="font-semibold text-sm text-foreground">{day}</h3>
                </div>
                {periods.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No periods scheduled</div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3">
                    {periods.sort((a, b) => a.periodNumber - b.periodNumber).map((period, i) => (
                      <div key={i} className={cn('flex flex-col items-center px-4 py-3 rounded-xl text-white min-w-[100px] text-center', PERIOD_COLORS[i % PERIOD_COLORS.length])}>
                        <span className="text-[10px] font-semibold opacity-80 mb-1">Period {period.periodNumber}</span>
                        <span className="text-sm font-bold">{period.subject?.name || 'Break'}</span>
                        <span className="text-[10px] opacity-80 mt-1">{period.teacher?.firstName || ''}</span>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] opacity-80">
                          <Clock className="w-2.5 h-2.5" />
                          {period.startTime}–{period.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimetablePage;

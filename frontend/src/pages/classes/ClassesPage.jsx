import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users, ChevronDown, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { classesAPI } from '../../api';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const SectionsList = ({ classId, isAdmin }) => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', capacity: 40, academicYear: new Date().getFullYear().toString() });

  const { data: sections, isLoading } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => classesAPI.sections(classId),
    select: (r) => r.data.data,
    enabled: !!classId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => classesAPI.createSection(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId] });
      setShowAddForm(false);
      setNewSection({ name: '', capacity: 40, academicYear: new Date().getFullYear().toString() });
    },
  });

  const handleAddSection = (e) => {
    e.preventDefault();
    if (!newSection.name.trim()) return;
    createMutation.mutate(newSection);
  };

  if (isLoading) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Sections ({sections?.length || 0})
      </p>

      {sections?.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-2">
          {sections.map((sec) => (
            <div key={sec._id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/60 rounded-lg text-xs">
              <Layers className="w-3 h-3 text-primary" />
              <span className="font-medium text-foreground">{sec.name}</span>
              {sec.classTeacher && (
                <span className="text-muted-foreground">
                  — {sec.classTeacher.firstName} {sec.classTeacher.lastName}
                </span>
              )}
              <span className="text-muted-foreground">({sec.capacity})</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mb-2">No sections yet</p>
      )}

      {isAdmin && (
        <>
          {showAddForm ? (
            <form onSubmit={handleAddSection} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder="Section name (e.g. A)"
                value={newSection.name}
                onChange={(e) => setNewSection((p) => ({ ...p, name: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary/30"
                autoFocus
              />
              <input
                type="number"
                placeholder="Capacity"
                value={newSection.capacity}
                onChange={(e) => setNewSection((p) => ({ ...p, capacity: parseInt(e.target.value) || 40 }))}
                className="w-16 px-2 py-1 text-xs rounded-lg border border-border bg-background outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button type="submit" disabled={createMutation.isPending} className="px-2 py-1 text-xs rounded-lg gradient-primary text-white font-medium disabled:opacity-50">
                {createMutation.isPending ? '...' : 'Add'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-2 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:bg-accent">
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              <Plus className="w-3 h-3" /> Add Section
            </button>
          )}
        </>
      )}
    </div>
  );
};

const ClassesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);

  const isAdmin = ['admin', 'principal'].includes(user?.role);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch classes — backend returns flat array
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.list(),
    select: (r) => r.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: classesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err) => {
      alert(err?.response?.data?.message || 'Error deleting class.');
    },
  });

  // Filter classes by search term
  const filteredClasses = (classes || []).filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title text-2xl font-bold">Class Management</h1>
          <p className="page-subtitle text-sm text-muted-foreground">
            {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'} found
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/classes/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search classes…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-5 border border-border bg-card rounded-xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted w-2/3 rounded mb-2" />
                  <div className="h-3 bg-muted w-1/3 rounded" />
                </div>
              </div>
              <div className="h-8 bg-muted rounded mt-3" />
            </div>
          ))
        ) : filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card border border-border rounded-xl text-muted-foreground text-sm">
            No classes found.
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const isExpanded = expandedClass === cls._id;
            return (
              <div key={cls._id} className="p-5 border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Class Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {cls.numericName || cls.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Academic Year: {cls.academicYear || '—'}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                    cls.isActive !== false
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {cls.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {cls.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cls.description}</p>
                )}

                {/* Expand/Collapse Sections */}
                <button
                  onClick={() => setExpandedClass(isExpanded ? null : cls._id)}
                  className="flex items-center gap-1 mt-3 text-xs text-primary hover:underline font-medium"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {isExpanded ? 'Hide Sections' : 'View Sections'}
                </button>

                {isExpanded && <SectionsList classId={cls._id} isAdmin={isAdmin} />}

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => navigate(`/classes/${cls._id}/edit`)}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                      title="Edit Class"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this class?')) {
                          deleteMutation.mutate(cls._id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
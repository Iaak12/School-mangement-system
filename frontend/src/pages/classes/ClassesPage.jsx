  import  { useState, useEffect } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { useNavigate } from 'react-router-dom';
  import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
  import { classesAPI } from '../../api';
  import { cn, getStatusColor } from '../../lib/utils';
  import useAuthStore from '../../store/authStore';

  const ClassesPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Base query parameters state
    const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' });
    // Local input state to prevent immediate API requests on every single keystroke
    const [searchInput, setSearchInput] = useState('');
    
    const isAdmin = ['admin', 'principal'].includes(user?.role);

    // Debounce user keystrokes by 400ms before hitting the backend
    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        setParams((p) => ({ ...p, search: searchInput, page: 1 }));
      }, 400);

      return () => clearTimeout(delayDebounce);
    }, [searchInput]);

    // Fetch classes data based on query parameters
    const { data, isLoading } = useQuery({
      queryKey: ['classes', params],
      queryFn: () => classesAPI.list(params),
      select: (res) => res?.data?.data,
    });
    

    // Handle class profile deletion using your exact classesAPI.delete setup
    const deleteMutation = useMutation({
      mutationFn: classesAPI.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['classes'] });
      },
      onError: (err) => {
        alert(err?.response?.data?.message || 'Error occurred deleting this class record.');
      }
    });

    const classes = data || [];
    const pagination = data?.pagination || { total: 0, page: 1, pages: 1 };

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header flex justify-between items-center">
          <div>
            <h1 className="page-title text-2xl font-bold">Class Management</h1>
            <p className="page-subtitle text-sm text-muted-foreground">
              {pagination.total || 0} classes active
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

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="stat-card p-4 border border-border bg-card rounded-xl animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted mb-3" />
                  <div className="h-4 bg-muted w-3/4 rounded mb-2" />
                  <div className="h-3 bg-muted w-1/2 rounded mb-3" />
                  <div className="h-6 bg-muted w-24 rounded-lg" />
                </div>
              </div>
            ))
          ) : classes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card border border-border rounded-xl text-muted-foreground text-sm">
              No class records found matching your parameters.
            </div>
          ) : (
            classes.map((item) => (
              <div 
                key={item._id} 
                className="stat-card p-4 border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between" 
                onClick={() => navigate(`/classes/${item._id}`)}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Class Code/Name Indicator Logo */}
                  <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center text-white text-xl font-bold mb-3">
                    {item.name?.[0] || ''}{item.section?.[0] || ''}
                  </div>
                  
                  {/* Class Name & Metadata */}
                  <h3 className="font-semibold text-foreground">
                    {item.name} {item.section ? `- ${item.section}` : ''}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Teacher: {item.classTeacher ? `${item.classTeacher.firstName} ${item.classTeacher.lastName}` : 'Assigned Soon'}
                  </p>
                  
                  {/* Student Population Badge */}
                  <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-accent/60 text-muted-foreground rounded-lg text-xs font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{item.studentCount || 0} Students</span>
                  </div>
                  
                  <span className={cn('mt-3 text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(item.status))}>
                    {item.status || 'active'}
                  </span>
                </div>

                {/* Management Actions Context Layer */}
                {isAdmin && (
                  <div 
                    className="flex justify-center gap-2 mt-4 pt-3 border-t border-border" 
                    onClick={(e) => e.stopPropagation()} // Prevents parent grid card navigation trigger
                  >
                    <button 
                      onClick={() => navigate(`/classes/${item._id}/edit`)} 
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                      title="Edit Class Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { 
                        if (confirm('Are you completely sure you want to delete this class configuration?')) {
                          deleteMutation.mutate(item._id); 
                        }
                      }} 
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                      title="Delete Class Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Actions Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button 
              disabled={params.page <= 1} 
              onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} 
              className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {params.page} of {pagination.pages}
            </span>
            <button 
              disabled={params.page >= pagination.pages} 
              onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} 
              className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  export default ClassesPage;
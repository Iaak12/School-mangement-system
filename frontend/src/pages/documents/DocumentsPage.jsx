import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Download, FileText, Eye } from 'lucide-react';
import { documentsAPI } from '../../api';
import { formatDate, cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const DocumentsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 20, search: '', status: '' });
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsAPI.list(params),
    select: (res) => res.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: documentsAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const documents = data?.documents || [];
  const pagination = data?.pagination || {};

  const handleDownload = (e, fileUrl, fileName) => {
    e.stopPropagation();
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="page-subtitle">{pagination.total || 0} files uploaded</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/documents/new')} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search documents…"
          value={params.search}
          onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-32 w-full rounded-xl" />
            </div>
          ))
        ) : documents.map((doc) => (
          <div 
            key={doc._id} 
            className="stat-card cursor-pointer" 
            onClick={() => navigate(`/documents/${doc._id}`)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center text-white text-xl font-bold mb-3">
                <FileText className="w-8 h-8" />
              </div>
              
              <h3 className="font-semibold text-foreground line-clamp-1 w-full px-2" title={doc.title}>
                {doc.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.category || 'General File'}</p>
              
              <div className="flex flex-col items-center gap-0.5 mt-2 text-[11px] text-muted-foreground">
                {doc.fileSize && <span>Size: {doc.fileSize}</span>}
                {doc.createdAt && <span>Uploaded: {formatDate(doc.createdAt)}</span>}
              </div>
              
              <span className={cn('mt-3 text-xs px-2.5 py-1 rounded-full font-medium capitalize', getStatusColor(doc.status))}>
                {doc.status || 'Active'}
              </span>
            </div>

            <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => handleDownload(e, doc.fileUrl, doc.title)} 
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>

              <button 
                onClick={() => navigate(`/documents/${doc._id}`)} 
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              {isAdmin && (
                <button 
                  onClick={() => { if (confirm('Delete this file permanently?')) deleteMutation.mutate(doc._id); }} 
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} 
            className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button 
            disabled={pagination.page >= pagination.pages} 
            onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} 
            className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, FileText, Download, Clock } from 'lucide-react';
import { documentsAPI } from '../../api';
import { formatDate, cn, getStatusColor } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  // Queries all documents and selects the matching ID locally to safeguard against missing endpoints
  const { data: document, isLoading } = useQuery({
    queryKey: ['documents', { detailId: id }],
    queryFn: () => documentsAPI.list({ limit: 100 }), 
    select: (res) => res.data.data.documents?.find(d => d._id === id)
  });

  const verifyMutation = useMutation({
    mutationFn: () => documentsAPI.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Document reference record data link profile missing.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/documents')} className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">File Meta Properties</h1>
          <p className="page-subtitle">Security parameters and storage location attributes</p>
        </div>
      </div>

      <div className="stat-card p-6 bg-card border border-border rounded-xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-xl gradient-success text-white">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 flex-1">
            <h2 className="text-lg font-bold text-foreground break-all">{document.title}</h2>
            <p className="text-xs text-muted-foreground">{document.category || 'General File'}</p>
            <div className="pt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', getStatusColor(document.status))}>
                {document.status || 'Unverified'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-4 text-xs">
          <div>
            <span className="text-muted-foreground block">File Storage Footprint</span>
            <span className="font-medium text-foreground">{document.fileSize || 'Unknown Size'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Registration Date</span>
            <span className="font-medium text-foreground">{formatDate(document.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-foreground text-sm font-medium rounded-xl hover:bg-border transition-colors"
          >
            <Download className="w-4 h-4" /> Download Original Document File
          </a>

          {isAdmin && document.status !== 'verified' && (
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-md hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Mark Verified
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;
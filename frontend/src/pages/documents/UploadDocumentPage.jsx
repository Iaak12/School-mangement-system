import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { documentsAPI } from '../../api';

const UploadDocumentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const uploadMutation = useMutation({
    mutationFn: documentsAPI.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate('/documents');
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Failed to upload document.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title || file.name);
    formData.append('category', category);
    formData.append('document', file); // Targets backend storage interceptor key

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/documents')} 
          className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title text-xl">Upload New Document</h1>
          <p className="page-subtitle">Add files, receipts, or templates to management storage</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stat-card p-6 space-y-4 bg-card border border-border rounded-xl">
        {error && (
          <div className="text-xs p-3 rounded-lg bg-red-50 text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Document Title (Optional)</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Leaves filename format if blank…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Category</label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General Certificate</option>
            <option value="Syllabus">Curriculum / Syllabus</option>
            <option value="Fee Receipt">Fee Slips & Receipts</option>
            <option value="ID Card">Identification Cards</option>
            <option value="Exam Paper">Exam Papers</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">File Attachment</label>
          <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-accent/40 transition-colors cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setError('');
              }}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
                {file ? file.name : 'Click to browse or drop file here'}
              </p>
              {file && (
                <p className="text-[10px] text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent font-medium text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Upload File'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocumentPage;
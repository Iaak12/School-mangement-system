import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { libraryAPI } from '../../api';
import { Search, BookOpen, Plus, RefreshCw } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const LibraryPage = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('books');
  const [search, setSearch] = useState('');
  const isLibrarian = ['librarian', 'admin', 'principal'].includes(user?.role);

  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['library-books', search],
    queryFn: () => libraryAPI.books({ search }),
    select: (r) => r.data.data,
    enabled: tab === 'books',
  });

  const { data: issuedData, isLoading: issuedLoading } = useQuery({
    queryKey: ['library-issued'],
    queryFn: () => libraryAPI.issued(),
    select: (r) => r.data.data,
    enabled: tab === 'issued',
  });

  const books = booksData?.books || [];
  const issued = issuedData?.issued || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Management</h1>
          <p className="page-subtitle">Book catalog and issue management</p>
        </div>
        {isLibrarian && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent">
              <RefreshCw className="w-4 h-4" /> Issue / Return
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90">
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-accent/50 rounded-xl w-fit">
        {['books', 'issued'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors', tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {t === 'books' ? 'Book Catalog' : 'Issued Books'}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab === 'books' && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search books, authors…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {tab === 'books' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {booksLoading ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />) :
            books.map((book) => (
              <div key={book._id} className="stat-card">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0', book.availableCopies > 0 ? 'gradient-success' : 'gradient-danger')}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>ISBN</span><span className="font-mono">{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category</span><span className="capitalize">{book.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Copies</span><span>{book.totalCopies}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Available</span>
                    <span className={book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}>{book.availableCopies}</span>
                  </div>
                </div>

                {isLibrarian && (
                  <button className={cn('w-full mt-4 py-2 rounded-lg text-xs font-medium transition-all', book.availableCopies > 0 ? 'gradient-primary text-white hover:opacity-90' : 'bg-accent text-muted-foreground cursor-not-allowed')} disabled={book.availableCopies === 0}>
                    {book.availableCopies > 0 ? 'Issue Book' : 'Not Available'}
                  </button>
                )}
              </div>
            ))
          }
        </div>
      )}

      {tab === 'issued' && (
        <div className="data-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Book</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Issued To</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Issue Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issued.map((rec) => (
                  <tr key={rec._id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{rec.book?.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.book?.isbn}</p>
                    </td>
                    <td className="px-4 py-3">{rec.issuedTo?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(rec.issueDate)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(rec.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', rec.status === 'returned' ? 'badge-active' : rec.status === 'overdue' ? 'badge-overdue' : 'badge-pending')}>{rec.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">₹{rec.finePaid || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;

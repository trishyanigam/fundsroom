import React, { useState, useEffect, useCallback } from 'react';
import {
  Challan,
  getChallansApi,
  cancelChallanApi
} from '../services/challanService';

interface ChallanListPageProps {
  userRole?: string;
  onCreateNew?: () => void;
  onViewChallan?: (id: string) => void;
  onEditChallan?: (challan: Challan) => void;
}

export const ChallanListPage: React.FC<ChallanListPageProps> = ({
  userRole = 'ADMIN',
  onCreateNew,
  onViewChallan,
  onEditChallan
}) => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const canCreateOrEdit = userRole === 'ADMIN' || userRole === 'SALES';

  const fetchChallans = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getChallansApi({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });

      if (response.success) {
        setChallans(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.total);
      }
    } catch (err: any) {
      console.error('Fetch Challans Error:', err);
      const msg = err.response?.data?.message || 'Failed to load sales challans.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const handleCancel = async (id: string, challanNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel draft ${challanNumber}?`)) return;
    try {
      await cancelChallanApi(id);
      fetchChallans();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel draft challan.';
      alert(msg);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">DRAFT</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">CONFIRMED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sales Challan Management</h1>
          <p className="text-sm text-slate-500">Draft, view, and manage sales challan vouchers</p>
        </div>

        {canCreateOrEdit && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
          >
            + Create Sales Challan
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search challan # or customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPage(1);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
            <p className="text-sm">Loading sales challans...</p>
          </div>
        ) : challans.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-700 mb-1">No sales challans found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a new draft sales challan to start issuing customer delivery vouchers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5">Challan #</th>
                  <th className="px-6 py-3.5">Customer / Business</th>
                  <th className="px-6 py-3.5">Total Qty</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created By</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{c.challanNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.customer?.customerName}</div>
                      <div className="text-xs text-slate-500">{c.customer?.businessName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{c.totalQuantity} units</td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {c.createdBy?.name || 'System User'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {onViewChallan && (
                        <button
                          onClick={() => onViewChallan(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
                        >
                          View
                        </button>
                      )}
                      {canCreateOrEdit && c.status === 'DRAFT' && onEditChallan && (
                        <button
                          onClick={() => onEditChallan(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {canCreateOrEdit && c.status === 'DRAFT' && (
                        <button
                          onClick={() => handleCancel(c.id, c.challanNumber)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && challans.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(page * limit, totalRecords)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{totalRecords}</span> entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

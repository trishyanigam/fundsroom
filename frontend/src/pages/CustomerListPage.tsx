import React, { useState, useEffect, useCallback } from 'react';
import {
  Customer,
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  CreateCustomerPayload
} from '../services/customerService';
import { CustomerFormModal } from '../components/CustomerFormModal';

interface CustomerListPageProps {
  userRole?: string;
  onViewCustomer?: (id: string) => void;
}

export const CustomerListPage: React.FC<CustomerListPageProps> = ({
  userRole = 'ADMIN',
  onViewCustomer
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const canEditOrCreate = userRole === 'ADMIN' || userRole === 'SALES';

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCustomersApi({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
      });

      if (response.success) {
        setCustomers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.total);
      }
    } catch (err: any) {
      console.error('Fetch Customers Error:', err);
      const msg = err.response?.data?.error?.message || 'Failed to load customers.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = async (data: CreateCustomerPayload) => {
    await createCustomerApi(data);
    setPage(1);
    fetchCustomers();
  };

  const handleUpdateCustomer = async (data: CreateCustomerPayload) => {
    if (editingCustomer) {
      await updateCustomerApi(editingCustomer.id, data);
      fetchCustomers();
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">ACTIVE</span>;
      case 'LEAD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">LEAD</span>;
      case 'INACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">INACTIVE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'WHOLESALE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-100 text-sky-800 border border-sky-200">WHOLESALE</span>;
      case 'DISTRIBUTOR':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800 border border-purple-200">DISTRIBUTOR</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">RETAIL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Customer CRM Directory</h1>
          <p className="text-sm text-slate-500">Manage leads, wholesale buyers, and distributor relationships</p>
        </div>

        {canEditOrCreate && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
          >
            + Add Customer
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Field */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search name, business, phone, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">LEAD</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          {/* Customer Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Customer Types</option>
            <option value="RETAIL">RETAIL</option>
            <option value="WHOLESALE">WHOLESALE</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
          </select>

          {(search || statusFilter || typeFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
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

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
            <p className="text-sm">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-700 mb-1">No customers found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new customer to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5">Customer / Business</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Follow-up Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.customerName}</div>
                      <div className="text-xs text-slate-500 font-medium">{c.businessName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-800 font-mono">{c.mobile}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(c.customerType)}</td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {onViewCustomer && (
                        <button
                          onClick={() => onViewCustomer(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
                        >
                          View
                        </button>
                      )}
                      {canEditOrCreate && (
                        <button
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                        >
                          Edit
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
        {!loading && customers.length > 0 && (
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

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        initialData={editingCustomer}
        title={editingCustomer ? 'Edit Customer Record' : 'Add New Customer'}
      />
    </div>
  );
};

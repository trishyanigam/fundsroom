import React, { useState, useEffect, useCallback } from 'react';
import {
  StockMovement,
  getMovementsApi,
  createMovementApi,
  CreateMovementPayload
} from '../services/inventoryService';
import { Product, getProductsApi } from '../services/productService';
import { MovementFormModal } from '../components/MovementFormModal';

interface InventoryPageProps {
  userRole?: string;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ userRole = 'ADMIN' }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Filters
  const [productIdFilter, setProductIdFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const canCreateMovements = userRole === 'ADMIN' || userRole === 'WAREHOUSE';

  // Load Product Catalog for dropdown filter
  useEffect(() => {
    getProductsApi({ limit: 100 })
      .then((res) => {
        if (res.success) setProducts(res.data);
      })
      .catch((err) => console.error('Failed to load products for filter:', err));
  }, []);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMovementsApi({
        page,
        limit,
        productId: productIdFilter || undefined,
        movementType: typeFilter || undefined,
        fromDate: fromDateFilter || undefined,
        toDate: toDateFilter || undefined,
      });

      if (response.success) {
        setMovements(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.total);
      }
    } catch (err: any) {
      console.error('Fetch Movements Error:', err);
      const msg = err.response?.data?.message || 'Failed to load stock movements history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, productIdFilter, typeFilter, fromDateFilter, toDateFilter]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleCreateMovement = async (data: CreateMovementPayload) => {
    await createMovementApi(data);
    setPage(1);
    fetchMovements();
  };

  const renderMovementTypeBadge = (type: string) => {
    if (type === 'IN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          🟢 STOCK IN (+)
        </span>
      );
    }
    if (type === 'OUT') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
          🔴 STOCK OUT (-)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        ⚙️ {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inventory & Stock Movements</h1>
          <p className="text-sm text-slate-500">
            Transactional stock audit log with row-level negative stock protection
          </p>
        </div>

        {canCreateMovements && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
          >
            + Log Stock Movement
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Product Filter */}
          <select
            value={productIdFilter}
            onChange={(e) => {
              setProductIdFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Movement Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Movement Types</option>
            <option value="IN">IN (Stock Added)</option>
            <option value="OUT">OUT (Stock Removed)</option>
          </select>

          {/* From Date */}
          <input
            type="date"
            value={fromDateFilter}
            onChange={(e) => {
              setFromDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            title="From Date"
          />

          {/* To Date */}
          <input
            type="date"
            value={toDateFilter}
            onChange={(e) => {
              setToDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            title="To Date"
          />

          {(productIdFilter || typeFilter || fromDateFilter || toDateFilter) && (
            <button
              onClick={() => {
                setProductIdFilter('');
                setTypeFilter('');
                setFromDateFilter('');
                setToDateFilter('');
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

      {/* Movements Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
            <p className="text-sm">Loading stock audit trail...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-700 mb-1">No stock movements recorded</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Log an IN or OUT stock movement to begin tracking inventory changes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Movement Type</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Reason / Reference</th>
                  <th className="px-6 py-3.5">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {new Date(m.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{m.product?.name || 'Unknown Product'}</div>
                      <div className="text-xs font-mono text-slate-500">{m.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4">{renderMovementTypeBadge(m.movementType)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-base">
                      {m.movementType === 'IN' ? (
                        <span className="text-emerald-700">+{m.quantity}</span>
                      ) : (
                        <span className="text-rose-700">-{m.quantity}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 max-w-xs">{m.reason}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-800">{m.createdBy?.name || 'System User'}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Role: {m.createdBy?.role}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && movements.length > 0 && (
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

      {/* Movement Modal */}
      <MovementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMovement}
        title="Log Inventory Stock Movement (IN / OUT)"
      />
    </div>
  );
};

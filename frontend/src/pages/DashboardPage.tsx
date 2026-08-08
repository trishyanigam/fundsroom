import React, { useState, useEffect } from 'react';
import {
  DashboardSummaryData,
  getDashboardSummaryApi
} from '../services/dashboardService';

interface DashboardPageProps {
  userRole?: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  onNavigate: (tab: string) => void;
  onViewChallan: (id: string) => void;
  onCreateChallan?: () => void;
  onCreateCustomer?: () => void;
  onCreateProduct?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userRole = 'ADMIN',
  onNavigate,
  onViewChallan,
  onCreateChallan,
  onCreateCustomer,
  onCreateProduct
}) => {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getDashboardSummaryApi();
        if (response.success) {
          setSummary(response.data);
        }
      } catch (err: any) {
        console.error('Fetch Dashboard Summary Error:', err);
        const msg = err.response?.data?.message || 'Failed to load dashboard summary metrics.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">📝 DRAFT</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✅ CONFIRMED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">🚫 CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
        <p className="text-sm">Loading operations dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Operations Portal Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time wholesale ERP analytics, inventory levels, recent delivery challans, and role-based quick action controls.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-xs font-semibold">
          <span>Active Role Context:</span>
          <span className="bg-sky-500 text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase">{userRole}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
            <span className="text-xl">👥</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {summary?.totalCustomers ?? 0}
          </div>
          <div className="text-xs text-sky-600 font-medium mt-2 flex items-center">
            <span>Manage Customer CRM →</span>
          </div>
        </div>

        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
            <span className="text-xl">📦</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {summary?.totalProducts ?? 0}
          </div>
          <div className="text-xs text-sky-600 font-medium mt-2 flex items-center">
            <span>View Product Catalog →</span>
          </div>
        </div>

        {/* Low Stock Items Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Low Stock Alerts</span>
            <span className="text-xl">⚠️</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-mono">
            {summary?.lowStockProducts ?? 0}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-2 flex items-center">
            <span>Check Inventory Movements →</span>
          </div>
        </div>

        {/* Total Sales Challans */}
        <div
          onClick={() => onNavigate('challans')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sales Challans</span>
            <span className="text-xl">📄</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {summary?.totalChallans ?? 0}
          </div>
          <div className="text-xs text-sky-600 font-medium mt-2 flex items-center">
            <span>Manage Delivery Vouchers →</span>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Actions Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Operational Shortcuts ({userRole} Role)
        </h3>
        <div className="flex flex-wrap gap-3">
          {(userRole === 'ADMIN' || userRole === 'SALES') && onCreateCustomer && (
            <button
              onClick={onCreateCustomer}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
            >
              + Add Customer
            </button>
          )}

          {(userRole === 'ADMIN' || userRole === 'WAREHOUSE') && onCreateProduct && (
            <button
              onClick={onCreateProduct}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
            >
              + Add Product
            </button>
          )}

          {(userRole === 'ADMIN' || userRole === 'SALES') && onCreateChallan && (
            <button
              onClick={onCreateChallan}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
            >
              + Create Sales Challan
            </button>
          )}

          <button
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-300 transition-all"
          >
            View Inventory Movements
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Challans & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Challans (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Sales Challans ({summary?.recentChallans.length || 0})
            </h3>
            <button
              onClick={() => onNavigate('challans')}
              className="text-xs font-semibold text-sky-700 hover:underline"
            >
              View All Challans →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {!summary?.recentChallans || summary.recentChallans.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent sales challans recorded.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="px-4 py-2.5">Challan #</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Qty</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {summary.recentChallans.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.challanNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{c.customerName}</div>
                        <div className="text-[11px] text-slate-500">{c.businessName}</div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                      <td className="px-4 py-3 font-mono font-bold">{c.totalQuantity}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onViewChallan(c.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Items Alert Section (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center space-x-1">
              <span>⚠️ Low Stock Items ({summary?.lowStockProducts || 0})</span>
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-rose-700 hover:underline"
            >
              Catalog →
            </button>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {!summary?.lowStockItems || summary.lowStockItems.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">
                <span className="text-emerald-600 font-bold block mb-1">✅ Inventory Healthy</span>
                No items are currently below minimum stock threshold.
              </div>
            ) : (
              summary.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.sku} ({item.warehouseLocation})</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-700 font-mono">{item.currentStock} units</div>
                    <div className="text-[10px] text-slate-500">Min: {item.minimumStock}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

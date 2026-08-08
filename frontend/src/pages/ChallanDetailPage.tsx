import React, { useState, useEffect, useCallback } from 'react';
import { Challan, getChallanByIdApi, cancelChallanApi } from '../services/challanService';

interface ChallanDetailPageProps {
  challanId: string;
  userRole?: string;
  onBack: () => void;
  onEditDraft?: (challan: Challan) => void;
}

export const ChallanDetailPage: React.FC<ChallanDetailPageProps> = ({
  challanId,
  userRole = 'ADMIN',
  onBack,
  onEditDraft
}) => {
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const canEditOrCancel = (userRole === 'ADMIN' || userRole === 'SALES') && challan?.status === 'DRAFT';

  const fetchChallanDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getChallanByIdApi(challanId);
      if (response.success) {
        setChallan(response.data);
      }
    } catch (err: any) {
      console.error('Fetch Challan Details Error:', err);
      const msg = err.response?.data?.message || 'Failed to load sales challan profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [challanId]);

  useEffect(() => {
    fetchChallanDetails();
  }, [fetchChallanDetails]);

  const handleCancelChallan = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft sales challan?')) return;
    try {
      setIsCancelling(true);
      await cancelChallanApi(challanId);
      setIsCancelling(false);
      fetchChallanDetails();
    } catch (err: any) {
      setIsCancelling(false);
      const msg = err.response?.data?.message || 'Failed to cancel draft challan.';
      alert(msg);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">📝 DRAFT</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">✅ CONFIRMED</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700 border border-slate-300">🚫 CANCELLED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
        <p className="text-sm">Loading sales challan details...</p>
      </div>
    );
  }

  if (error || !challan) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-8">
        <p className="text-rose-600 font-semibold mb-2">{error || 'Challan not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm"
        >
          ← Back to Sales Challans
        </button>
      </div>
    );
  }

  const grandTotalAmount = challan.items.reduce((sum, item) => {
    const price = parseFloat(String(item.unitPrice)) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 font-mono">{challan.challanNumber}</h1>
              {getStatusBadge(challan.status)}
            </div>
            <p className="text-xs text-slate-500">
              Created on {new Date(challan.createdAt).toLocaleString('en-IN')} by {challan.createdBy?.name} ({challan.createdBy?.role})
            </p>
          </div>
        </div>

        {canEditOrCancel && (
          <div className="flex items-center space-x-3">
            {onEditDraft && (
              <button
                onClick={() => onEditDraft(challan)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
              >
                Edit Draft Items
              </button>
            )}
            <button
              onClick={handleCancelChallan}
              disabled={isCancelling}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm rounded-lg border border-rose-200 transition-all disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Challan'}
            </button>
          </div>
        )}
      </div>

      {/* Customer & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Details</h2>
          <div className="font-bold text-slate-900 text-base">{challan.customer?.customerName}</div>
          <div className="text-xs text-slate-600 font-medium">{challan.customer?.businessName}</div>
          <div className="text-xs text-slate-500 font-mono">{challan.customer?.mobile}</div>
          <div className="text-xs text-slate-500">{challan.customer?.email}</div>
          {challan.customer?.address && (
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 mt-2">
              {challan.customer.address}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Voucher Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">Total Quantity</label>
                <span className="text-xl font-bold text-slate-900 font-mono">{challan.totalQuantity} units</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">Estimated Valuation</label>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">Stock Impact</label>
                <span className="text-xs font-bold text-slate-500 block mt-1">
                  {challan.status === 'DRAFT' ? '🔒 Zero Mutation (Phase 7 Draft)' : challan.status}
                </span>
              </div>
            </div>
          </div>

          {challan.status === 'DRAFT' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs mt-4">
              💡 <strong>Phase 7 Note:</strong> This challan is in <strong>DRAFT</strong> status. Products and stock quantities have been validated and snapshotted, but inventory has not been deducted yet. Confirmation will be completed in Phase 8.
            </div>
          )}
        </div>
      </div>

      {/* Historical Items Snapshot Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Historical Line Item Snapshots ({challan.items.length})
          </h3>
          <span className="text-[11px] text-slate-500">Prices frozen as of creation timestamp</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Snapshot Unit Price</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {challan.items.map((item) => {
                const price = parseFloat(String(item.unitPrice)) || 0;
                const subtotal = price * item.quantity;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.productName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                    <td className="px-6 py-4 font-mono">
                      ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900 text-sm">
                <td colSpan={3} className="px-6 py-3.5 text-right uppercase text-xs text-slate-500">
                  Total Quantities & Valuation:
                </td>
                <td className="px-6 py-3.5 font-mono text-base">{challan.totalQuantity} units</td>
                <td className="px-6 py-3.5 text-right font-mono text-base">
                  ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

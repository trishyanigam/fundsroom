import React, { useState, useEffect } from 'react';
import { CreateMovementPayload, MovementType } from '../services/inventoryService';
import { Product, getProductsApi } from '../services/productService';

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMovementPayload) => Promise<void>;
  title: string;
}

export const MovementFormModal: React.FC<MovementFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [reason, setReason] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingProducts(true);
      getProductsApi({ limit: 100 })
        .then((res) => {
          if (res.success && res.data.length > 0) {
            setProducts(res.data);
            setSelectedProductId(res.data[0].id);
          }
        })
        .catch(() => setErrorMsg('Failed to load products.'))
        .finally(() => setLoadingProducts(false));

      setQuantity('');
      setMovementType('IN');
      setReason('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const qtyNum = parseInt(quantity, 10) || 0;
  const isInsufficientWarning =
    movementType === 'OUT' && selectedProduct && qtyNum > selectedProduct.currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProductId) return setErrorMsg('Please select a product.');
    if (!qtyNum || qtyNum <= 0) return setErrorMsg('Quantity must be an integer greater than 0.');
    if (!reason.trim()) return setErrorMsg('Reason for movement is required.');

    if (isInsufficientWarning) {
      return setErrorMsg(
        `Cannot dispatch ${qtyNum} units. Available stock is only ${selectedProduct?.currentStock} units.`
      );
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        productId: selectedProductId,
        quantity: qtyNum,
        movementType,
        reason: reason.trim(),
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      const serverMsg = err.response?.data?.message || 'Failed to record stock movement.';
      setErrorMsg(serverMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Product <span className="text-rose-500">*</span>
            </label>
            {loadingProducts ? (
              <div className="text-xs text-slate-500 py-2">Loading catalog...</div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stock: {p.currentStock} units
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Current Stock Banner */}
          {selectedProduct && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Current Stock Level:</span>
              <span className="font-bold text-slate-900 text-sm font-mono">
                {selectedProduct.currentStock} units
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Movement Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Movement Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    movementType === 'IN'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  🟢 STOCK IN (+)
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    movementType === 'OUT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  🔴 STOCK OUT (-)
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Quantity Changed <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* Insufficient Stock Alert Banner */}
          {isInsufficientWarning && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between">
              <span>⚠️ OUT quantity exceeds available stock!</span>
              <span>Available: {selectedProduct.currentStock}</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Reason / Reference <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Purchase Shipment #PO-402, Stock Audit Adjustment"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(isInsufficientWarning)}
              className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Transaction...' : 'Commit Stock Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Product, CreateProductPayload, UpdateProductPayload } from '../services/productService';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Product | null;
  title: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '',
    minimumStock: '',
    warehouseLocation: '',
  });

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        unitPrice: String(initialData.unitPrice || ''),
        currentStock: String(initialData.currentStock || '0'),
        minimumStock: String(initialData.minimumStock || '5'),
        warehouseLocation: initialData.warehouseLocation || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        unitPrice: '',
        currentStock: '0',
        minimumStock: '5',
        warehouseLocation: '',
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) return setErrorMsg('Product name is required.');
    if (!formData.sku.trim()) return setErrorMsg('SKU code is required.');
    if (!formData.category.trim()) return setErrorMsg('Category is required.');
    
    const priceNum = parseFloat(formData.unitPrice);
    if (isNaN(priceNum) || priceNum < 0) return setErrorMsg('Unit price must be a number >= 0.');

    const minStockNum = parseInt(formData.minimumStock, 10);
    if (isNaN(minStockNum) || minStockNum < 0) return setErrorMsg('Minimum stock alert must be an integer >= 0.');

    if (!formData.warehouseLocation.trim()) return setErrorMsg('Warehouse location is required.');

    try {
      setIsSubmitting(true);
      if (isEditMode) {
        const updatePayload: UpdateProductPayload = {
          name: formData.name.trim(),
          sku: formData.sku.trim().toUpperCase(),
          category: formData.category.trim(),
          unitPrice: priceNum,
          minimumStock: minStockNum,
          warehouseLocation: formData.warehouseLocation.trim(),
        };
        await onSubmit(updatePayload);
      } else {
        const stockNum = parseInt(formData.currentStock, 10);
        if (isNaN(stockNum) || stockNum < 0) {
          setIsSubmitting(false);
          return setErrorMsg('Initial stock cannot be negative.');
        }

        const createPayload: CreateProductPayload = {
          name: formData.name.trim(),
          sku: formData.sku.trim().toUpperCase(),
          category: formData.category.trim(),
          unitPrice: priceNum,
          currentStock: stockNum,
          minimumStock: minStockNum,
          warehouseLocation: formData.warehouseLocation.trim(),
        };
        await onSubmit(createPayload);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      const serverMsg = err.response?.data?.message || 'Failed to save product. Please try again.';
      setErrorMsg(serverMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Laptop Stand M1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                SKU / Product Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. LAP-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Hardware, Electronics"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Unit Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                placeholder="e.g. 1500.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Stock Field Handling */}
            {!isEditMode ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Initial Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Current Stock Level
                </label>
                <input
                  type="text"
                  value={`${formData.currentStock} units (Locked)`}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-amber-600 mt-1 font-medium">
                  🔒 Stock updates are managed via Phase 6 Inventory module.
                </p>
              </div>
            )}

            {/* Minimum Stock Alert */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Min Stock Alert Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* Warehouse Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Warehouse / Bin Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="warehouseLocation"
              value={formData.warehouseLocation}
              onChange={handleChange}
              placeholder="e.g. Delhi Main Warehouse - Aisle 3, Rack B"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

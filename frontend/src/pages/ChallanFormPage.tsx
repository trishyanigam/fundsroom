import React, { useState, useEffect } from 'react';
import {
  Challan,
  createChallanApi,
  updateChallanApi,
  ChallanItemInputPayload
} from '../services/challanService';
import { Customer, getCustomersApi } from '../services/customerService';
import { Product, getProductsApi } from '../services/productService';

interface ChallanFormPageProps {
  initialData?: Challan | null;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormLineItem {
  productId: string;
  quantity: number;
}

export const ChallanFormPage: React.FC<ChallanFormPageProps> = ({
  initialData,
  onBack,
  onSuccess
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { productId: '', quantity: 1 }
  ]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const [custRes, prodRes] = await Promise.all([
          getCustomersApi({ limit: 100 }),
          getProductsApi({ limit: 100 })
        ]);

        if (custRes.success) setCustomers(custRes.data);
        if (prodRes.success) setProducts(prodRes.data);

        if (initialData) {
          setSelectedCustomerId(initialData.customerId);
          if (initialData.items && initialData.items.length > 0) {
            setLineItems(
              initialData.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity
              }))
            );
          }
        } else if (custRes.success && custRes.data.length > 0) {
          setSelectedCustomerId(custRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load customers or products:', err);
        setErrorMsg('Failed to initialize form dropdowns.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [initialData]);

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof FormLineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const totalQuantityPreview = lineItems.reduce((sum, item) => sum + (parseInt(String(item.quantity), 10) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCustomerId) return setErrorMsg('Please select a customer.');
    if (lineItems.length === 0) return setErrorMsg('At least one product line item is required.');

    const cleanItems: ChallanItemInputPayload[] = [];
    const usedProducts = new Set<string>();

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      if (!item.productId) return setErrorMsg(`Line #${i + 1}: Please select a product.`);
      if (usedProducts.has(item.productId)) {
        return setErrorMsg(`Duplicate product selected in line items. Combine quantities instead.`);
      }
      usedProducts.add(item.productId);

      const qty = parseInt(String(item.quantity), 10);
      if (isNaN(qty) || qty <= 0) return setErrorMsg(`Line #${i + 1}: Quantity must be > 0.`);
      cleanItems.push({ productId: item.productId, quantity: qty });
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && initialData) {
        await updateChallanApi(initialData.id, {
          customerId: selectedCustomerId,
          items: cleanItems
        });
      } else {
        await createChallanApi({
          customerId: selectedCustomerId,
          items: cleanItems,
          status: 'DRAFT'
        });
      }
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      const serverMsg = err.response?.data?.message || 'Failed to save sales challan.';
      setErrorMsg(serverMsg);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
        <p className="text-sm">Loading challan form dependencies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isEditMode ? `Edit Sales Challan (${initialData?.challanNumber})` : 'Create Sales Challan (Draft)'}
            </h1>
            <p className="text-xs text-slate-500">
              Draft challans preserve historical product snapshots with zero stock deduction
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Customer Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Select Customer <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            required
          >
            <option value="" disabled>-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customerName} ({c.businessName}) — {c.mobile}
              </option>
            ))}
          </select>
        </div>

        {/* Line Items Section */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Challan Line Items
            </h3>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors"
            >
              + Add Product Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => {
              const selectedProd = products.find((p) => p.id === item.productId);
              const price = selectedProd ? parseFloat(String(selectedProd.unitPrice)) : 0;
              const subtotal = price * (item.quantity || 0);

              return (
                <div
                  key={index}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  {/* Product Dropdown */}
                  <div className="md:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Product #{index + 1}
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleLineItemChange(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — ₹{parseFloat(String(p.unitPrice)).toLocaleString('en-IN')} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Estimated Line Subtotal */}
                  <div className="md:col-span-2 text-right">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Snapshot Subtotal
                    </label>
                    <span className="text-sm font-semibold text-slate-800 font-mono">
                      ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-2 text-sm"
                      title="Remove Item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-4">
          <div className="text-sm text-slate-600">
            Total Calculated Items Quantity:{' '}
            <span className="font-bold text-slate-900 font-mono text-base">{totalQuantityPreview} units</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Draft...' : isEditMode ? 'Update Draft Challan' : 'Save as Draft Challan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

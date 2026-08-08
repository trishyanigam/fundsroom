import React, { useState, useEffect, useCallback } from 'react';
import { Product, getProductByIdApi, updateProductApi, UpdateProductPayload } from '../services/productService';
import { ProductFormModal } from '../components/ProductFormModal';

interface ProductDetailPageProps {
  productId: string;
  userRole?: string;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  userRole = 'ADMIN',
  onBack
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const canEdit = userRole === 'ADMIN' || userRole === 'WAREHOUSE';

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProductByIdApi(productId);
      if (response.success) {
        setProduct(response.data);
      }
    } catch (err: any) {
      console.error('Fetch Product Details Error:', err);
      const msg = err.response?.data?.message || 'Failed to load product profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleUpdateProduct = async (data: UpdateProductPayload) => {
    if (product) {
      await updateProductApi(product.id, data);
      fetchProductDetails();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-8">
        <p className="text-rose-600 font-semibold mb-2">{error || 'Product not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  const isLowStock = product.currentStock <= product.minimumStock;

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
            <h1 className="text-2xl font-extrabold text-slate-900">{product.name}</h1>
            <p className="text-xs font-mono font-bold text-slate-500">{product.sku}</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
          >
            Edit Product Metadata
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stock & Price Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock & Pricing Summary</h2>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">Unit Price</label>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ₹{parseFloat(String(product.unitPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">Inventory Stock Level</label>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-xl font-bold text-slate-900">{product.currentStock} units</span>
              {isLowStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  LOW STOCK
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  IN STOCK
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">Minimum Stock Alert Threshold</label>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{product.minimumStock} units</p>
          </div>
        </div>

        {/* Right Column: Catalog Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog & Warehouse Specifications</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">Category</label>
                <p className="font-semibold text-slate-900 mt-0.5">{product.category}</p>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">SKU Code</label>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{product.sku}</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block uppercase">Warehouse Location / Bin</label>
              <p className="text-sm font-medium text-slate-800 mt-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {product.warehouseLocation}
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-between">
              <span>Added: {new Date(product.createdAt).toLocaleDateString()}</span>
              <span>Last Modified: {new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateProduct}
        initialData={product}
        title="Edit Product Details"
      />
    </div>
  );
};

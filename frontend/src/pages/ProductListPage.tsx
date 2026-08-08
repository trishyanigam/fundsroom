import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  getProductsApi,
  createProductApi,
  updateProductApi,
  CreateProductPayload,
  UpdateProductPayload
} from '../services/productService';
import { ProductFormModal } from '../components/ProductFormModal';

interface ProductListPageProps {
  userRole?: string;
  onViewProduct?: (id: string) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({
  userRole = 'ADMIN',
  onViewProduct
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);

  // Dynamic Options for Categories & Warehouses
  const [categories, setCategories] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<string[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const canCreateOrEdit = userRole === 'ADMIN' || userRole === 'WAREHOUSE';

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProductsApi({
        page,
        limit,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        warehouseLocation: warehouseFilter || undefined,
        lowStock: lowStockFilter ? true : undefined,
      });

      if (response.success) {
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.total);

        // Extract categories and warehouses dynamically for filter dropdowns
        const cats = Array.from(new Set(response.data.map(p => p.category))).filter(Boolean);
        const whs = Array.from(new Set(response.data.map(p => p.warehouseLocation))).filter(Boolean);
        if (cats.length > 0) setCategories(prev => Array.from(new Set([...prev, ...cats])));
        if (whs.length > 0) setWarehouses(prev => Array.from(new Set([...prev, ...whs])));
      }
    } catch (err: any) {
      console.error('Fetch Products Error:', err);
      const msg = err.response?.data?.message || 'Failed to load product catalog.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryFilter, warehouseFilter, lowStockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async (data: CreateProductPayload) => {
    await createProductApi(data);
    setPage(1);
    fetchProducts();
  };

  const handleUpdateProduct = async (data: UpdateProductPayload) => {
    if (editingProduct) {
      await updateProductApi(editingProduct.id, data);
      fetchProducts();
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const renderStockBadge = (product: Product) => {
    const isLowStock = product.currentStock <= product.minimumStock;
    if (isLowStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          ⚠️ LOW STOCK ({product.currentStock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        IN STOCK ({product.currentStock})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Product Catalog Management</h1>
          <p className="text-sm text-slate-500">Manage catalog SKUs, unit pricing, bin locations, and low-stock alerts</p>
        </div>

        {canCreateOrEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search name, SKU, or category..."
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
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={(e) => {
              setWarehouseFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh} value={wh}>
                {wh}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => {
              setLowStockFilter((prev) => !prev);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              lowStockFilter
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {lowStockFilter ? '✓ Showing Low Stock' : '⚠️ Filter Low Stock'}
          </button>

          {(search || categoryFilter || warehouseFilter || lowStockFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setWarehouseFilter('');
                setLowStockFilter(false);
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

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
            <p className="text-sm">Loading product catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-700 mb-1">No products found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new product to your inventory catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Stock Status</th>
                  <th className="px-6 py-3.5">Min Alert</th>
                  <th className="px-6 py-3.5">Warehouse Bin</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs font-mono text-slate-500 font-semibold">{p.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹{parseFloat(String(p.unitPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">{renderStockBadge(p)}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{p.minimumStock} units</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{p.warehouseLocation}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {onViewProduct && (
                        <button
                          onClick={() => onViewProduct(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors"
                        >
                          View
                        </button>
                      )}
                      {canCreateOrEdit && (
                        <button
                          onClick={() => openEditModal(p)}
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
        {!loading && products.length > 0 && (
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

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        initialData={editingProduct}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
      />
    </div>
  );
};

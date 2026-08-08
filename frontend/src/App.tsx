import React, { useState, useEffect } from 'react';
import { checkHealth } from './services/api';
import { CustomerListPage } from './pages/CustomerListPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

export const App: React.FC = () => {
  const [apiHealthStatus, setApiHealthStatus] = useState<string>('Checking...');
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  // Active View State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'customerDetail' | 'products' | 'productDetail'>('products');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Current Role (Default: ADMIN; selectable via role switcher)
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS'>('ADMIN');

  useEffect(() => {
    checkHealth()
      .then((data) => {
        if (data && data.success) {
          setApiHealthStatus(data.message || 'API is running');
          setIsHealthy(true);
        } else {
          setApiHealthStatus('API response error');
          setIsHealthy(false);
        }
      })
      .catch(() => {
        setApiHealthStatus('Backend offline / Unreachable');
        setIsHealthy(false);
      });
  }, []);

  const handleViewCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setActiveTab('customerDetail');
  };

  const handleBackToCustomerList = () => {
    setSelectedCustomerId(null);
    setActiveTab('customers');
  };

  const handleViewProduct = (id: string) => {
    setSelectedProductId(id);
    setActiveTab('productDetail');
  };

  const handleBackToProductList = () => {
    setSelectedProductId(null);
    setActiveTab('products');
  };

  const showCustomerCrm = currentRole !== 'WAREHOUSE';

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h1 className="font-bold text-lg text-white leading-tight">
            Mini ERP + CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">Operations Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3 py-2 text-sm rounded font-medium flex items-center justify-between transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Dashboard</span>
          </button>

          {/* Customer CRM Tab (Hidden for WAREHOUSE role) */}
          {showCustomerCrm && (
            <button
              onClick={() => {
                setSelectedCustomerId(null);
                setActiveTab('customers');
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded font-medium flex items-center justify-between transition-colors ${
                activeTab === 'customers' || activeTab === 'customerDetail'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>Customer CRM</span>
            </button>
          )}

          {/* Products Tab (All roles allowed) */}
          <button
            onClick={() => {
              setSelectedProductId(null);
              setActiveTab('products');
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded font-medium flex items-center justify-between transition-colors ${
              activeTab === 'products' || activeTab === 'productDetail'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Product Management</span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">
              Phase 5
            </span>
          </button>

          <div className="px-3 py-2 text-sm rounded text-slate-500 cursor-not-allowed">
            Inventory (Phase 6)
          </div>
          <div className="px-3 py-2 text-sm rounded text-slate-500 cursor-not-allowed">
            Sales Challans (Phase 7)
          </div>
        </nav>

        {/* Role Switcher Demo Control */}
        <div className="p-4 border-t border-slate-800 text-xs">
          <label className="text-slate-500 font-semibold block uppercase mb-1">Demo Role Context</label>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as any)}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ADMIN">ADMIN (Full Access)</option>
            <option value="WAREHOUSE">WAREHOUSE (Products CRUD)</option>
            <option value="SALES">SALES (Products Read-Only)</option>
            <option value="ACCOUNTS">ACCOUNTS (Products Read-Only)</option>
          </select>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Mini ERP + CRM Operations Portal
            </h2>
            <p className="text-xs text-slate-500">Wholesale & Distribution Enterprise Platform</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              Phase 5 - Product Catalog Complete
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
              Role: {currentRole}
            </span>
          </div>
        </header>

        {/* Body View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'dashboard' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-slate-900 to-sky-900 text-white rounded-xl p-6 shadow-md">
                <h3 className="text-2xl font-extrabold mb-2">
                  Mini ERP + CRM Operations Portal
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                  Phase 5 Product Management active. Manage catalog SKUs, unit pricing, warehouse bin locations, and low-stock alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-700">Backend API Health</h4>
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          isHealthy === true
                            ? 'bg-emerald-500 animate-pulse'
                            : isHealthy === false
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-slate-100 p-2 rounded border border-slate-200 mt-2">
                      GET /api/health → {apiHealthStatus}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Product Catalog Module</h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Catalog SKUs & Warehouse Locations</li>
                      <li>Low-Stock Filter Alerts (`currentStock &lt;= minimumStock`)</li>
                      <li>Direct Stock Edit Immunity (Phase 6 Inventory handles stock movements)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && showCustomerCrm && (
            <CustomerListPage
              userRole={currentRole}
              onViewCustomer={handleViewCustomer}
            />
          )}

          {activeTab === 'customerDetail' && selectedCustomerId && showCustomerCrm && (
            <CustomerDetailPage
              customerId={selectedCustomerId}
              userRole={currentRole}
              onBack={handleBackToCustomerList}
            />
          )}

          {activeTab === 'products' && (
            <ProductListPage
              userRole={currentRole}
              onViewProduct={handleViewProduct}
            />
          )}

          {activeTab === 'productDetail' && selectedProductId && (
            <ProductDetailPage
              productId={selectedProductId}
              userRole={currentRole}
              onBack={handleBackToProductList}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerListPage } from './pages/CustomerListPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChallanListPage } from './pages/ChallanListPage';
import { ChallanDetailPage } from './pages/ChallanDetailPage';
import { ChallanFormPage } from './pages/ChallanFormPage';
import { Challan } from './services/challanService';

export const App: React.FC = () => {
  // Active View State (Default: Dashboard)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'customers' | 'customerDetail' | 'products' | 'productDetail' | 'inventory' | 'challans' | 'challanDetail' | 'challanForm'
  >('dashboard');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedChallanId, setSelectedChallanId] = useState<string | null>(null);
  const [editingChallan, setEditingChallan] = useState<Challan | null>(null);

  // Current Role (Selectable via role switcher)
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS'>('ADMIN');


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Operations Portal?')) {
      localStorage.removeItem('token');
      setActiveTab('dashboard');
      alert('Logged out successfully.');
    }
  };

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

  const handleViewChallan = (id: string) => {
    setSelectedChallanId(id);
    setActiveTab('challanDetail');
  };

  const handleCreateChallan = () => {
    setEditingChallan(null);
    setActiveTab('challanForm');
  };

  const handleEditChallan = (challan: Challan) => {
    setEditingChallan(challan);
    setActiveTab('challanForm');
  };

  const handleBackToChallanList = () => {
    setSelectedChallanId(null);
    setEditingChallan(null);
    setActiveTab('challans');
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
            <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">
              Phase 9
            </span>
          </button>

          {/* Customer CRM Tab */}
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

          {/* Products Tab */}
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
          </button>

          {/* Inventory Movements Tab */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-3 py-2 text-sm rounded font-medium flex items-center justify-between transition-colors ${
              activeTab === 'inventory'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Inventory Movements</span>
          </button>

          {/* Sales Challans Tab */}
          <button
            onClick={() => {
              setSelectedChallanId(null);
              setEditingChallan(null);
              setActiveTab('challans');
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded font-medium flex items-center justify-between transition-colors ${
              activeTab === 'challans' || activeTab === 'challanDetail' || activeTab === 'challanForm'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Sales Challans</span>
          </button>
        </nav>

        {/* Role Switcher Demo Control */}
        <div className="p-4 border-t border-slate-800 text-xs">
          <label className="text-slate-500 font-semibold block uppercase mb-1">Demo Role Context</label>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as any)}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ADMIN">ADMIN (Full System Access)</option>
            <option value="SALES">SALES (CRM & Sales Challans)</option>
            <option value="WAREHOUSE">WAREHOUSE (Products & Stock)</option>
            <option value="ACCOUNTS">ACCOUNTS (Read-Only Audit)</option>
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
            <p className="text-xs text-slate-500">Enterprise Operations Platform</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 9 Complete
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
              User: {currentRole}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded border border-slate-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Body View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'dashboard' && (
            <DashboardPage
              userRole={currentRole}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onViewChallan={handleViewChallan}
              onCreateChallan={handleCreateChallan}
              onCreateCustomer={() => setActiveTab('customers')}
              onCreateProduct={() => setActiveTab('products')}
            />
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

          {activeTab === 'inventory' && (
            <InventoryPage userRole={currentRole} />
          )}

          {activeTab === 'challans' && (
            <ChallanListPage
              userRole={currentRole}
              onCreateNew={handleCreateChallan}
              onViewChallan={handleViewChallan}
              onEditChallan={handleEditChallan}
            />
          )}

          {activeTab === 'challanForm' && (
            <ChallanFormPage
              initialData={editingChallan}
              onBack={handleBackToChallanList}
              onSuccess={handleBackToChallanList}
            />
          )}

          {activeTab === 'challanDetail' && selectedChallanId && (
            <ChallanDetailPage
              challanId={selectedChallanId}
              userRole={currentRole}
              onBack={handleBackToChallanList}
              onEditDraft={handleEditChallan}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

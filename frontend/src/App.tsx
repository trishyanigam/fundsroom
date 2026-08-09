import React, { useState, useEffect } from 'react';
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
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { User, UserRole, getMeApi } from './services/authService';

export const App: React.FC = () => {
  // Active View State (Default: landing)
  const [activeTab, setActiveTab] = useState<
    'landing' | 'login' | 'register' | 'dashboard' | 'customers' | 'customerDetail' | 'products' | 'productDetail' | 'inventory' | 'challans' | 'challanDetail' | 'challanForm'
  >('landing');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedChallanId, setSelectedChallanId] = useState<string | null>(null);
  const [editingChallan, setEditingChallan] = useState<Challan | null>(null);

  // Authenticated states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [selectedRoleContext, setSelectedRoleContext] = useState<UserRole | undefined>(undefined);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const response = await getMeApi();
        if (response.success && response.data) {
          setCurrentUser(response.data);
          setCurrentRole(response.data.role);
          setActiveTab('dashboard');
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('token');
      } finally {
        setAuthChecking(false);
      }
    };
    initAuth();
  }, []);

  const handleLoginSuccess = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setCurrentRole(user.role);
    setActiveTab('dashboard');
  };

  const handleRegisterSuccess = (registeredRole: UserRole) => {
    setSelectedRoleContext(registeredRole);
    setActiveTab('login');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Operations Portal?')) {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setCurrentRole(null);
      setActiveTab('landing');
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

  const showCustomerCrm = currentRole && currentRole !== 'WAREHOUSE';

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading System Session...</p>
      </div>
    );
  }

  if (!currentUser) {
    if (activeTab === 'login') {
      return (
        <LoginPage
          initialRole={selectedRoleContext}
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={(role) => {
            setSelectedRoleContext(role);
            setActiveTab('register');
          }}
          onBackToHome={() => setActiveTab('landing')}
        />
      );
    }
    if (activeTab === 'register') {
      return (
        <RegisterPage
          initialRole={selectedRoleContext}
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={(role) => {
            setSelectedRoleContext(role);
            setActiveTab('login');
          }}
          onBackToHome={() => setActiveTab('landing')}
        />
      );
    }
    return (
      <LandingPage
        onNavigateToLogin={(role) => {
          setSelectedRoleContext(role);
          setActiveTab('login');
        }}
        onNavigateToRegister={(role) => {
          setSelectedRoleContext(role);
          setActiveTab('register');
        }}
      />
    );
  }

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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
              User: {currentUser.name} ({currentRole})
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
              userRole={currentRole!}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onViewChallan={handleViewChallan}
              onCreateChallan={handleCreateChallan}
              onCreateCustomer={() => setActiveTab('customers')}
              onCreateProduct={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'customers' && showCustomerCrm && (
            <CustomerListPage
              userRole={currentRole!}
              onViewCustomer={handleViewCustomer}
            />
          )}

          {activeTab === 'customerDetail' && selectedCustomerId && showCustomerCrm && (
            <CustomerDetailPage
              customerId={selectedCustomerId}
              userRole={currentRole!}
              onBack={handleBackToCustomerList}
            />
          )}

          {activeTab === 'products' && (
            <ProductListPage
              userRole={currentRole!}
              onViewProduct={handleViewProduct}
            />
          )}

          {activeTab === 'productDetail' && selectedProductId && (
            <ProductDetailPage
              productId={selectedProductId}
              userRole={currentRole!}
              onBack={handleBackToProductList}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage userRole={currentRole!} />
          )}

          {activeTab === 'challans' && (
            <ChallanListPage
              userRole={currentRole!}
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
              userRole={currentRole!}
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

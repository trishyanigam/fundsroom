import React, { useState, useEffect } from 'react';
import { checkHealth } from './services/api';

export const App: React.FC = () => {
  const [apiHealthStatus, setApiHealthStatus] = useState<string>('Checking...');
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

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

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Placeholder Layout */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h1 className="font-bold text-lg text-white leading-tight">
            Mini ERP + CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">Operations Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navigation (Placeholder)
          </div>
          <div className="px-3 py-2 text-sm rounded bg-slate-800 text-white font-medium flex items-center justify-between">
            <span>Dashboard</span>
            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Phase 1</span>
          </div>
          <div className="px-3 py-2 text-sm rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-not-allowed">
            Customers (Phase 4)
          </div>
          <div className="px-3 py-2 text-sm rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-not-allowed">
            Products (Phase 5)
          </div>
          <div className="px-3 py-2 text-sm rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-not-allowed">
            Inventory (Phase 6)
          </div>
          <div className="px-3 py-2 text-sm rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-not-allowed">
            Sales Challans (Phase 7)
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Role Access Matrix Ready
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
            {/* Required Phase 1 Setup Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              Phase 1 Setup
            </span>
          </div>
        </header>

        {/* Body View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-sky-900 text-white rounded-xl p-6 shadow-md">
              <h3 className="text-2xl font-extrabold mb-2">
                Mini ERP + CRM Operations Portal
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                Phase 1 project foundation established successfully. The application architecture, monorepo directory layout, TypeScript Express REST API server, and Vite React frontend shell are initialized.
              </p>
            </div>

            {/* System Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: API Connection Status */}
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
                <div className="mt-4 text-[11px] text-slate-400">
                  Target Endpoint: <code className="text-slate-600 font-semibold">http://localhost:5000/api/health</code>
                </div>
              </div>

              {/* Card 2: Environment Configuration */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Frontend Setup Status</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Vite + React 18 + TypeScript</li>
                    <li>Tailwind CSS styling engine enabled</li>
                    <li>Axios HTTP service initialized</li>
                  </ul>
                </div>
                <div className="mt-4 text-[11px] text-slate-400">
                  Environment: <code className="text-slate-600 font-semibold">{import.meta.env.MODE}</code>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

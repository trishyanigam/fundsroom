import React from 'react';
import { UserRole } from '../services/authService';
import { Shield, Users, Package, FileSpreadsheet, Lock } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: (role?: UserRole) => void;
  onNavigateToRegister: (role?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  const rolesInfo = [
    {
      role: 'ADMIN' as UserRole,
      title: 'System Administrator',
      icon: <Shield className="h-6 w-6 text-red-500" />,
      bgClass: 'border-red-500/20 hover:border-red-500/40 bg-white/70 hover:shadow-red-500/5',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      description: 'Superuser account. Complete system administration access to manage customers, SKUs, inventory logs, and challans.',
    },
    {
      role: 'SALES' as UserRole,
      title: 'Sales Executive',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      bgClass: 'border-blue-500/20 hover:border-blue-500/40 bg-white/70 hover:shadow-blue-500/5',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Customer CRM specialist. Register clients, track follow-ups, and generate/confirm sales challans.',
    },
    {
      role: 'WAREHOUSE' as UserRole,
      title: 'Warehouse Logistics',
      icon: <Package className="h-6 w-6 text-amber-500" />,
      bgClass: 'border-amber-500/20 hover:border-amber-500/40 bg-white/70 hover:shadow-amber-500/5',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Inventory tracking specialist. Log stock movements (IN/OUT), update bin locations, and manage catalogs.',
    },
    {
      role: 'ACCOUNTS' as UserRole,
      title: 'Financial Auditor',
      icon: <FileSpreadsheet className="h-6 w-6 text-emerald-500" />,
      bgClass: 'border-emerald-500/20 hover:border-emerald-500/40 bg-white/70 hover:shadow-emerald-500/5',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Read-only financial operations audit log. Complete compliance overview across all challan ledgers.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-neutral-950 text-white flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6 sm:px-12 flex justify-between items-center bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-600 text-white p-2 rounded-xl shadow-lg shadow-sky-500/20 border border-sky-500/30">
            <Shield className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Fundsroom
            </h1>
            <p className="text-[10px] text-sky-400 uppercase tracking-widest font-bold">Operations Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigateToLogin()}
            className="text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigateToRegister()}
            className="text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-sky-500/10 border border-sky-400/20"
          >
            Register Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-16 px-6 sm:px-12 max-w-7xl mx-auto space-y-16">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
            Enterprise Grade CRM + ERP
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-500 bg-clip-text text-transparent">
            Wholesale Distribution & Inventory Control
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A secure role-based operations control center designed to manage wholesale stock flows, automate sales challans, track customer lead CRM pipelines, and log transactional logs.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
              <Lock className="h-4 w-4 text-sky-400" />
              Role-Based Access Portals
            </h3>
            <span className="text-xs text-slate-500 font-semibold uppercase">Authorized Personnel Only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rolesInfo.map((roleCard) => (
              <div 
                key={roleCard.role}
                className={`border rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:bg-neutral-900/40 ${roleCard.bgClass}`}
              >
                <div className="space-y-4">
                  {/* Icon & Title */}
                  <div className="flex items-center justify-between">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5 shadow-inner">
                      {roleCard.icon}
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${roleCard.badgeClass}`}>
                      {roleCard.role}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-100">{roleCard.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {roleCard.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800/40">
                  <button
                    onClick={() => onNavigateToLogin(roleCard.role)}
                    className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-white/5 py-2.5 px-3 rounded-xl transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigateToRegister(roleCard.role)}
                    className={`text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm ${roleCard.buttonClass}`}
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-12 flex flex-col sm:flex-row justify-between items-center bg-slate-950/20 text-xs text-slate-500">
        <p>© 2026 Fundsroom. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0 font-medium">
          <span className="hover:text-slate-400 transition-colors">Enterprise Security</span>
          <span>•</span>
          <span className="hover:text-slate-400 transition-colors">Operations Audit</span>
        </div>
      </footer>

    </div>
  );
};

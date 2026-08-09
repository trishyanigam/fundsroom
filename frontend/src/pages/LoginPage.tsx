import React, { useState } from 'react';
import { UserRole, loginUserApi } from '../services/authService';
import { Shield, Key, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess: (token: string, user: any) => void;
  onNavigateToRegister: (role?: UserRole) => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole,
  onLoginSuccess,
  onNavigateToRegister,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole || 'ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Development credentials database
  const devCredentials = [
    { role: 'ADMIN' as UserRole, email: 'admin@erp.local', password: 'AdminPass123!', name: 'Admin Account' },
    { role: 'SALES' as UserRole, email: 'sales@erp.local', password: 'SalesPass123!', name: 'Sales Account' },
    { role: 'WAREHOUSE' as UserRole, email: 'warehouse@erp.local', password: 'WarehousePass123!', name: 'Warehouse Account' },
    { role: 'ACCOUNTS' as UserRole, email: 'accounts@erp.local', password: 'AccountsPass123!', name: 'Accounts Account' },
  ];

  const handleFillCredentials = (cred: typeof devCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setRole(cred.role);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await loginUserApi({ email, password });
      
      if (response.success && response.data) {
        onLoginSuccess(response.data.token, response.data.user);
      } else {
        setError('Authentication response failed.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute w-96 h-96 rounded-full bg-sky-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-purple-500/5 blur-3xl -bottom-20 -right-20 pointer-events-none" />

      {/* Back Button */}
      <button 
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Portal Home</span>
      </button>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Side: Login Form Card */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-3.5">
              <div className="bg-sky-600/10 border border-sky-500/25 p-2.5 rounded-2xl text-sky-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Access Control Center</h2>
                <p className="text-xs text-slate-400">Sign in to your wholesale workspace account</p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Context Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access Role Context</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="ADMIN">ADMIN Portal Control</option>
                  <option value="SALES">SALES CRM Operations</option>
                  <option value="WAREHOUSE">WAREHOUSE Inventory Logistics</option>
                  <option value="ACCOUNTS">ACCOUNTS Auditor Ledger</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@erp.local"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-sky-500/5 disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Log In to System</span>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/40 text-center text-xs text-slate-500 font-medium">
            <span>Don't have an account? </span>
            <button 
              onClick={() => onNavigateToRegister(role)}
              className="text-sky-400 hover:text-sky-300 font-bold transition-all underline decoration-sky-500/30 decoration-2"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Right Side: Seed Account Helper */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800/60 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-400 animate-pulse" />
              Dev Environment Accounts
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Seeded testing accounts are pre-configured with mapped system access scopes. Click any profile to automatically pre-fill login inputs.
            </p>
          </div>

          <div className="space-y-3 mt-6">
            {devCredentials.map((cred) => (
              <div
                key={cred.role}
                onClick={() => handleFillCredentials(cred)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  role === cred.role
                    ? 'border-sky-500/40 bg-sky-500/5 text-white'
                    : 'border-slate-850 bg-slate-900/30 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{cred.name}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    role === cred.role
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {cred.role}
                  </span>
                </div>
                <div className="text-[10px] font-mono mt-1 text-slate-500 font-bold">
                  {cred.email}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-[10px] text-slate-600 font-bold text-center leading-relaxed">
            Note: Stock mutation and edit permissions are enforced by secure backend JWT token checks.
          </div>
        </div>

      </div>

    </div>
  );
};
export default LoginPage;

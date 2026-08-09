import React, { useState } from 'react';
import { UserRole, registerUserApi } from '../services/authService';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  initialRole?: UserRole;
  onRegisterSuccess: (registeredRole: UserRole) => void;
  onNavigateToLogin: (role?: UserRole) => void;
  onBackToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  initialRole,
  onRegisterSuccess,
  onNavigateToLogin,
  onBackToHome,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole || 'SALES');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await registerUserApi({
        name,
        email,
        password,
        role,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onRegisterSuccess(role);
        }, 2000);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Registration failed. Try a different email address.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-sky-500/5 blur-3xl -bottom-20 -right-20 pointer-events-none" />

      {/* Back Button */}
      <button 
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Portal Home</span>
      </button>

      <div className="w-full max-w-md relative z-10">
        
        <div className="bg-slate-900/40 border border-slate-800/85 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center space-x-3.5">
            <div className="bg-purple-600/10 border border-purple-500/25 p-2.5 rounded-2xl text-purple-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Create System Account</h2>
              <p className="text-xs text-slate-400">Register new enterprise role account</p>
            </div>
          </div>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-6 rounded-2xl text-center space-y-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-black">
                ✓
              </div>
              <h3 className="font-bold text-sm text-white">Account Created Successfully!</h3>
              <p className="text-xs text-slate-400">Redirecting to login dashboard...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-600"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@erp.local"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-600"
                    required
                  />
                </div>

                {/* Role dropdown Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Role Context</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="ADMIN">ADMIN (Full Access)</option>
                    <option value="SALES">SALES (CRM & Challans)</option>
                    <option value="WAREHOUSE">WAREHOUSE (Logistics & Stock)</option>
                    <option value="ACCOUNTS">ACCOUNTS (Read-Only Auditor)</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password (min. 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-600"
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
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-purple-500/5 disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="pt-4 border-t border-slate-800/40 text-center text-xs text-slate-500 font-medium">
            <span>Already have an account? </span>
            <button 
              onClick={() => onNavigateToLogin(role)}
              className="text-purple-400 hover:text-purple-300 font-bold transition-all underline decoration-purple-500/30 decoration-2"
            >
              Sign In
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
export default RegisterPage;

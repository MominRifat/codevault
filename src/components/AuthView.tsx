import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { Terminal, Lock, Mail, User, ShieldAlert, Cpu } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(username, password);
        onAuthSuccess(data.user);
      } else {
        const data = await api.register(username, email, password);
        onAuthSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setError('');
    setUsername('demo_coder');
    setPassword('demo1234');
    setIsLogin(true);
  };

  return (
    <div id="auth-view" className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0f1524]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden glow-blue"
      >
        {/* Header Branding */}
        <div className="px-8 pt-8 pb-4 text-center border-b border-slate-800/60 bg-slate-900/40">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 mb-4 animate-pulse">
            <Cpu size={32} />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center justify-center gap-2">
            Code<span className="text-blue-500">Vault</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 tracking-wide uppercase font-mono">
            Competitive Programming Second Brain
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-slate-800/50 bg-[#090d16]/40">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              isLogin ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              !isLogin ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3"
            >
              <ShieldAlert className="shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-semibold">Authentication Error:</span>
                <p className="mt-0.5 text-xs text-red-300/90">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-mono mb-1.5 uppercase tracking-wider">
                {isLogin ? 'Username or Email' : 'Username'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090d16] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  placeholder={isLogin ? "e.g., demo_coder or email" : "e.g., cp_master"}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-slate-300 text-xs font-mono mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090d16] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                    placeholder="e.g., dev@codevault.com"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-xs font-mono mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090d16] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-indigo-500 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50 text-sm shadow-lg shadow-blue-500/20 mt-6 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Terminal size={16} />
                  <span>{isLogin ? 'Initialize Second Brain' : 'Construct Account'}</span>
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              <span className="text-slate-500 text-xs font-mono uppercase tracking-wider block mb-3">Or explore instantly</span>
              <button
                onClick={fillDemoCredentials}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-blue-400 hover:text-blue-300 text-xs font-mono rounded-lg transition-colors cursor-pointer"
              >
                <Cpu size={14} className="animate-spin" />
                <span>Inject Demo Credentials</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-2 italic font-mono">
                Click above to test login instantly without creating an account (Password: demo1234)
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '', 
    department: '' 
  });
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);
    try {
      await register(registerForm);
      navigate('/dashboard');
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const quickLogin = (email) => setForm({ email, password: 'Password123!' });

  return (
    <div className="min-h-screen bg-app-bg bg-radial-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-teal to-brand-mint rounded-2xl mb-4 shadow-glow-teal animate-pulse-glow">
            <span className="text-black text-3xl font-bold font-rubik">P</span>
          </div>
          <h1 className="text-4xl font-bold text-gradient font-rubik mb-2">Profitcast</h1>
          <p className="text-text-secondary text-sm font-inter">Project Management System</p>
        </div>

        {/* Card */}
        <div className="card-glass">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-surface-highlight rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setIsRegisterMode(false)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isRegisterMode 
                  ? 'bg-gradient-to-r from-brand-teal to-brand-mint text-black shadow-glow-teal' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegisterMode(true)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isRegisterMode 
                  ? 'bg-gradient-to-r from-brand-teal to-brand-mint text-black shadow-glow-teal' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              New Employee
            </button>
          </div>

          {/* Login Form */}
          {!isRegisterMode && (
            <>
              <h2 className="text-2xl font-semibold text-text-primary mb-6 font-rubik">Sign in to your account</h2>

              {error && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl mb-4 text-sm animate-slide-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Email address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                    placeholder="you@profitcast.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span></span>
                  <Link to="/forgot-password" className="text-brand-teal hover:text-brand-mint font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Quick login */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-text-muted mb-3 font-medium font-inter">QUICK LOGIN (DEMO)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'MD', email: 'md@profitcast.com' },
                    { label: 'HR Manager', email: 'hr@profitcast.com' },
                    { label: 'Team Lead', email: 'teamlead@profitcast.com' },
                    { label: 'Employee', email: 'employee@profitcast.com' },
                  ].map((item) => (
                    <button
                      key={item.email}
                      onClick={() => quickLogin(item.email)}
                      className="text-xs bg-surface-highlight hover:bg-surface border border-white/10 text-text-secondary rounded-xl py-3 px-3 transition-all duration-200 text-left hover:border-brand-teal/50"
                    >
                      <span className="font-semibold text-text-primary font-rubik">{item.label}</span>
                      <br />
                      <span className="text-text-muted truncate block font-inter">{item.email}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3 text-center font-inter">Password: Password123!</p>
              </div>
            </>
          )}

          {/* Register Form */}
          {isRegisterMode && (
            <>
              <h2 className="text-2xl font-semibold text-text-primary mb-6 font-rubik">Create your account</h2>

              {registerError && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl mb-4 text-sm animate-slide-in">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">First Name</label>
                    <input
                      type="text"
                      required
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                      className="input-field"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Last Name</label>
                    <input
                      type="text"
                      required
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      className="input-field"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Email address</label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="input-field"
                    placeholder="john.doe@profitcast.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Department</label>
                  <select
                    required
                    value={registerForm.department}
                    onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 font-inter">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" disabled={registerLoading} className="btn-primary w-full py-3 text-base">
                  {registerLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegisterMode(false)}
                  className="text-brand-teal hover:text-brand-mint font-medium transition-colors"
                >
                  Sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

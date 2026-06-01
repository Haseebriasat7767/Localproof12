import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password, form.businessName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const field = (key, placeholder, type = 'text') => (
    <input type={type} placeholder={placeholder} required={key !== 'businessName'}
      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-8">
          <img src="/logo.svg" alt="LocalProof" className="w-8 h-8" /> LocalProof
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
        <p className="text-gray-500 mb-6 text-sm">$49/month · Cancel anytime</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          {field('name', 'Full name')}
          {field('email', 'Email address', 'email')}
          {field('password', 'Password (min 8 chars)', 'password')}
          {field('businessName', 'Business name')}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Get Started — $49/mo'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import BackButton from '@/components/BackButton';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    if (returnTo && returnTo.startsWith('/')) {
      sessionStorage.setItem('returnTo', returnTo);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.accessToken, response.data.user);
      const returnTo = sessionStorage.getItem('returnTo') || '/checkout';
      sessionStorage.removeItem('returnTo');
      router.push(returnTo);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm">
        <BackButton />
        <h1 className="text-2xl font-bold mb-2">Đăng nhập</h1>
        <p className="text-sm text-gray-500 mb-6">Đăng nhập để tiếp tục thanh toán.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-medium">
            Mật khẩu
            <input
              type="password"
              required
              minLength={1}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Mật khẩu"
            />
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-orange-600 font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}

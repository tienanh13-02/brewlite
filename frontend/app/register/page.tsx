'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import BackButton from '@/components/BackButton';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', { email, password });
      login(response.data.accessToken, response.data.user);
      router.push('/checkout');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm">
        <BackButton />
        <h1 className="text-2xl font-bold mb-2">Đăng ký</h1>
        <p className="text-sm text-gray-500 mb-6">Tạo tài khoản để đặt hàng.</p>

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
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Ít nhất 6 ký tự"
            />
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-orange-600 font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}

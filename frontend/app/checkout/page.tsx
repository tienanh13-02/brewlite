'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { generateIdempotencyKey } from '@/lib/uuid';
import BackButton from '@/components/BackButton';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const totalPrice = useCart((s) => s.totalPrice());
  const clear = useCart((s) => s.clear);
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const [method, setMethod] = useState<'Ví' | 'Thẻ'>('Ví');
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    orderId: number;
    total: number;
    method: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sinh key 1 lần duy nhất cho phiên checkout này
  const idempotencyKey = useMemo(() => generateIdempotencyKey(), []);

  useEffect(() => {
    // Chờ persisted auth store khôi phục trước khi quyết định có đăng nhập hay không.
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!token) {
      router.replace('/login?returnTo=/checkout');
      return;
    }

    let cancelled = false;
    setAuthChecking(true);

    api
      .get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        if (!cancelled) setAuthChecking(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 401) {
          logout();
          router.replace('/login?returnTo=/checkout');
          return;
        }
        setError(err.response?.data?.message || 'Không kiểm tra được tài khoản');
        setAuthChecking(false);
      })
      .finally(() => {
        if (!cancelled) setAuthChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, logout, router, token]);

  // Không hiển thị lại giỏ hàng trống khi thanh toán vừa thành công,
  // vì cart đã bị xóa trước khi trạng thái kết quả được render.
  if (items.length === 0 && !paymentResult) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>Giỏ hàng trống</p>
        <Link href="/" className="text-orange-600">← Về menu</Link>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!token) {
      router.push('/login?returnTo=/checkout');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Tạo order
      const orderRes = await api.post(
        '/orders',
        {
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            topping: i.topping,
            qty: i.qty,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = orderRes.data.id;

      // 3. Thanh toán
      const paymentRes = await api.post(
        '/payments',
        { orderId, method },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      if (paymentRes.data.status === 'SUCCESS') {
        const paidOrder = await api.get(`/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPaymentResult({
          orderId,
          total: paidOrder.data.total,
          method,
        });
        clear();
      } else {
        setError('Thanh toán thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

      {user && (
        <div className="bg-gray-100 rounded-lg p-3 text-sm mb-4">
          <span className="text-gray-500">Tài khoản:</span>{' '}
          <span className="font-semibold">{user.email}</span>
        </div>
      )}

      <div className="bg-orange-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">Tổng cộng:</p>
        <p className="text-2xl font-bold text-orange-600">
          {totalPrice.toLocaleString('vi-VN')}đ
        </p>
      </div>

      <div className="mb-4">
        <p className="font-semibold mb-2">Phương thức thanh toán</p>
        <div className="space-y-2">
          {(['Ví', 'Thẻ'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`w-full py-3 border rounded-lg text-left px-4 ${
                method === m
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-gray-300'
              }`}
            >
              {m === 'Ví' ? '💳 Ví điện tử' : '💳 Thẻ ngân hàng'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4" role="alert">
          {error}
        </div>
      )}

      {paymentResult && (
        <div
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          role="alert"
        >
          <div className="text-xl font-bold text-green-700 mb-2">✓ Thanh toán thành công</div>
          <p className="text-sm text-green-800 mb-2">
            Mã đơn: <strong>#{paymentResult.orderId}</strong>
          </p>
          <p className="text-sm text-green-800 mb-2">
            Tổng tiền: {paymentResult.total.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-sm text-green-800 mb-3">
            Phương thức: {paymentResult.method}
          </p>
          <p className="text-sm font-semibold text-green-800">
            Mời nhận đồ uống tại quầy.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/orders/${paymentResult.orderId}`)}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Xem chi tiết đơn hàng
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-2 w-full bg-white text-green-700 border border-green-300 py-2 rounded-lg font-semibold hover:bg-green-100"
          >
            Về trang chủ
          </button>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || authChecking || !authReady || !token}
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
      >
        {loading
          ? 'Đang xử lý...'
          : authChecking
            ? 'Đang kiểm tra tài khoản...'
            : token
              ? 'Xác nhận thanh toán'
              : 'Đăng nhập để thanh toán'}
      </button>
      {!token && authReady && !authChecking && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Bạn chưa đăng nhập. <Link href="/login?returnTo=/checkout" className="text-orange-600 font-semibold">Đăng nhập ngay</Link>
        </p>
      )}
    </div>
  );
}
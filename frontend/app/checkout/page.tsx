'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { api } from '@/lib/api';
import { generateIdempotencyKey } from '@/lib/uuid';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const totalPrice = useCart((s) => s.totalPrice());
  const clear = useCart((s) => s.clear);

  const [method, setMethod] = useState<'Ví' | 'Thẻ'>('Ví');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sinh key 1 lần duy nhất cho phiên checkout này
  const idempotencyKey = useMemo(() => generateIdempotencyKey(), []);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>Giỏ hàng trống</p>
        <Link href="/" className="text-orange-600">← Về menu</Link>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Lấy token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

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
        clear();
        router.push(`/orders/${orderId}`);
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
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

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
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : `Xác nhận thanh toán`}
      </button>
    </div>
  );
}
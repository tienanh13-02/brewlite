'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Header from '@/components/Header';

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: { id: number; qty: number }[];
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  PENDING: { text: 'Chờ thanh toán', color: 'text-yellow-600' },
  PAID: { text: 'Đã thanh toán', color: 'text-green-600' },
  PAYMENT_FAILED: { text: 'Thanh toán lỗi', color: 'text-red-600' },
  PREPARING: { text: 'Đang pha chế', color: 'text-blue-600' },
  READY: { text: 'Sẵn sàng', color: 'text-purple-600' },
  COMPLETED: { text: 'Hoàn thành', color: 'text-gray-600' },
  CANCELLED: { text: 'Đã hủy', color: 'text-gray-500' },
};

export default function OrdersHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .get<Order[]>('/orders/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Không tải được lịch sử');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <>
        <Header />
        <p className="text-center py-10 text-gray-500">Đang tải...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <p className="text-center py-10 text-red-500">{error}</p>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <Header />
        <div className="max-w-md mx-auto p-4 text-center py-10">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Đặt đơn đầu tiên
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
        <div className="space-y-3">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || {
              text: order.status,
              color: 'text-gray-600',
            };
            const totalQty = order.items.reduce((s, i) => s + i.qty, 0);

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block border rounded-lg p-4 bg-white hover:shadow-md transition"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold">Đơn #{order.id}</span>
                  <span className={`text-sm font-semibold ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{totalQty} sản phẩm</span>
                  <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="text-right font-bold text-orange-600">
                  {order.total.toLocaleString('vi-VN')}đ
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
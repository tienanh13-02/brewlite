'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Header from '@/components/Header';

interface OrderItem {
  id: number;
  productId: number;
  size: string;
  topping: string;
  qty: number;
  lineTotal: number;
}

interface Payment {
  id: number;
  status: string;
  method: string;
}

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .get<Order>(`/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrder(res.data))
      .catch((err) => {
        console.error(err);
        setError(
          err.response?.data?.message || 'Không tải được đơn hàng'
        );
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="max-w-md mx-auto p-4 text-center">
          <p className="text-red-500 mb-4">{error || 'Không tìm thấy đơn'}</p>
          <Link href="/" className="text-orange-600">
            ← Về trang chủ
          </Link>
        </div>
      </>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] || {
    text: order.status,
    color: 'text-gray-600',
  };

  const isSuccess = order.status === 'PAID';

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-4">
        {/* Icon thành công */}
        {isSuccess && (
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-3xl">
              ✓
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              Đặt hàng thành công!
            </h1>
          </div>
        )}

        {/* Thông tin đơn */}
        <div className="bg-white border rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Mã đơn:</span>
            <span className="font-bold">#{order.id}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Trạng thái:</span>
            <span className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Thời gian:</span>
            <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
          </div>
          {order.payment && (
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Phương thức:</span>
              <span>{order.payment.method}</span>
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white border rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-3">Sản phẩm</h2>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="text-sm text-gray-500">
                  Size {item.size} · {item.topping}
                </p>
                <p className="text-sm">SL: {item.qty}</p>
              </div>
              <p className="font-semibold">
                {item.lineTotal.toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="bg-orange-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-lg font-bold text-orange-600">
            <span>Tổng cộng:</span>
            <span>{order.total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Ghi chú */}
        {isSuccess && (
          <p className="text-center text-gray-500 text-sm mb-4">
            Mời quý khách lấy nước tại quầy
          </p>
        )}

        {/* Nút điều hướng */}
        <div className="space-y-2">
          <Link
            href="/orders"
            className="block bg-orange-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-orange-700"
          >
            Xem lịch sử đơn
          </Link>
          <Link
            href="/"
            className="block bg-white border text-gray-700 py-3 rounded-lg text-center font-semibold hover:bg-gray-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </>
  );
}
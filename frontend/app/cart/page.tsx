'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';

export default function CartPage() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQty = useCart((state) => state.updateQty);
  const totalPrice = useCart((state) => state.totalPrice);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>
        <p className="text-gray-500 mb-4">Giỏ hàng đang trống</p>
        <Link
          href="/"
          className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32">
      <h1 className="text-2xl font-bold mb-4">
        Giỏ hàng ({items.length} món)
      </h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.size}-${item.topping}`}
            className="border rounded-lg p-3 bg-white flex gap-3"
          >
            {/* Ảnh */}
            <div className="w-20 h-20 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 text-xs">Ảnh</span>
            </div>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                Size {item.size} · {item.topping}
              </p>
              <p className="text-orange-600 font-bold mt-1">
                {item.unitPrice.toLocaleString('vi-VN')}đ
              </p>

              {/* Điều khiển số lượng */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateQty(
                      item.productId,
                      item.size,
                      item.topping,
                      item.qty - 1
                    )
                  }
                  className="w-8 h-8 border rounded text-lg font-bold hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">
                  {item.qty}
                </span>
                <button
                  onClick={() =>
                    updateQty(
                      item.productId,
                      item.size,
                      item.topping,
                      item.qty + 1
                    )
                  }
                  className="w-8 h-8 border rounded text-lg font-bold hover:bg-gray-100"
                >
                  +
                </button>
                <button
                  onClick={() =>
                    removeItem(item.productId, item.size, item.topping)
                  }
                  className="ml-auto text-red-500 text-sm hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tổng tiền */}
      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <div className="flex justify-between text-lg font-bold text-orange-600">
          <span>Tổng cộng:</span>
          <span>{totalPrice().toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {/* Nút thanh toán */}
      <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto">
        <Link
          href="/checkout"
          className="block bg-orange-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-orange-700"
        >
          Thanh toán • {totalPrice().toLocaleString('vi-VN')}đ
        </Link>
      </div>
    </div>
  );
}
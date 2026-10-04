'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

const SIZE_EXTRA: Record<string, number> = {
  S: 0,
  M: 0,
  L: 5000,
};

const TOPPING_EXTRA: Record<string, number> = {
  'Không': 0,
  'Trân châu': 5000,
  'Kem': 7000,
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [size, setSize] = useState('M');
  const [topping, setTopping] = useState('Không');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;

    api
      .get<Product>(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Không tìm thấy sản phẩm'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="p-4 text-center">Đang tải...</p>;
  }

  if (error || !product) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error || 'Có lỗi xảy ra'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-orange-600 underline"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const unitPrice =
    product.price + SIZE_EXTRA[size] + TOPPING_EXTRA[topping];
  const total = unitPrice * qty;

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-orange-600 hover:underline"
      >
        ← Quay lại
      </button>

      <div className="bg-orange-100 h-48 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-orange-400">Ảnh sản phẩm</span>
      </div>

      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-500 mt-1">
        Giá gốc: {product.price.toLocaleString('vi-VN')}đ
      </p>

      {/* Size */}
      <div className="mt-6">
        <p className="font-semibold mb-2">Chọn size</p>
        <div className="flex gap-2">
          {Object.keys(SIZE_EXTRA).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-2 border rounded ${
                size === s
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {s}
              {SIZE_EXTRA[s] > 0 && (
                <span className="block text-xs">
                  +{SIZE_EXTRA[s].toLocaleString('vi-VN')}đ
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Topping */}
      <div className="mt-6">
        <p className="font-semibold mb-2">Chọn topping</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(TOPPING_EXTRA).map((t) => (
            <button
              key={t}
              onClick={() => setTopping(t)}
              className={`px-4 py-2 border rounded ${
                topping === t
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {t}
              {TOPPING_EXTRA[t] > 0 && (
                <span className="block text-xs">
                  +{TOPPING_EXTRA[t].toLocaleString('vi-VN')}đ
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Số lượng */}
      <div className="mt-6 flex items-center gap-4">
        <p className="font-semibold">Số lượng:</p>
        <div className="flex items-center border rounded">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-xl hover:bg-gray-100"
          >
            −
          </button>
          <span className="px-4 py-2 border-x min-w-[3rem] text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2 text-xl hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Đơn giá:</span>
          <span>{unitPrice.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between text-lg font-bold mt-2">
          <span>Tổng:</span>
          <span className="text-orange-600">
            {total.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          // Task 5 sẽ làm phần thêm vào giỏ
          alert(
            `Đã chọn: ${product.name} - Size ${size} - ${topping} - SL ${qty} - Tổng ${total.toLocaleString('vi-VN')}đ`
          );
        }}
        className="mt-4 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
      >
        Thêm vào giỏ
      </button>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/store/cart';
import ProductImage from '@/components/ProductImage';

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

  // Lấy hàm addItem từ Zustand store
  const addItem = useCart((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [topping, setTopping] = useState<string>('Không');
  const [qty, setQty] = useState(1);

  // Thông báo "đã thêm vào giỏ" (hiện 2 giây rồi ẩn)
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    setLoading(true);
    api
      .get<Product>(`/products/${params.id}`)
      .then((res) => {
        setProduct(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch product:', err);
        setError('Không tải được sản phẩm.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <p className="text-red-500 text-lg">{error || 'Không tìm thấy sản phẩm'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-orange-600 text-white rounded"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Derived state: tính lại mỗi lần render, không lưu vào state
  const unitPrice = product.price + SIZE_EXTRA[size] + TOPPING_EXTRA[topping];
  const total = unitPrice * qty;

  // Hàm xử lý khi bấm "Thêm vào giỏ"
  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      size,
      topping,
      unitPrice,
      qty,
      imageUrl: product.imageUrl,
    });

    // Hiện thông báo "đã thêm"
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <button
        onClick={() => router.back()}
        className="mb-4 text-orange-600 font-semibold flex items-center gap-1"
      >
        ← Quay lại
      </button>

      <ProductImage
        imageUrl={product.imageUrl}
        alt={product.name}
        className="bg-orange-100 h-48 rounded-lg mb-4"
      />

      <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
      <p className="text-gray-500 mt-1">
        Giá gốc: {product.price.toLocaleString('vi-VN')}đ
      </p>
      <p className="text-sm text-gray-400">
        Còn lại: {product.stock} sản phẩm
      </p>

      <div className="mt-6">
        <p className="font-semibold mb-2 text-gray-700">Chọn size</p>
        <div className="flex gap-2">
          {(['S', 'M', 'L'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-2 border rounded-lg transition ${
                size === s
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
              }`}
            >
              <div className="font-semibold">{s}</div>
              {SIZE_EXTRA[s] > 0 && (
                <div className="text-xs">+{SIZE_EXTRA[s] / 1000}k</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold mb-2 text-gray-700">Chọn topping</p>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(TOPPING_EXTRA).map((t) => (
            <button
              key={t}
              onClick={() => setTopping(t)}
              className={`px-4 py-2 border rounded-lg transition ${
                topping === t
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
              }`}
            >
              {t}
              {TOPPING_EXTRA[t] > 0 && (
                <span className="text-xs ml-1">
                  +{TOPPING_EXTRA[t] / 1000}k
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-semibold text-gray-700">Số lượng</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 border rounded-lg text-xl font-bold text-gray-700 hover:bg-gray-100"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="w-10 h-10 border rounded-lg text-xl font-bold text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Đơn giá:</span>
          <span>{unitPrice.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-orange-600 mt-1">
          <span>Tổng:</span>
          <span>{total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {/* Thông báo "đã thêm vào giỏ" */}
      {added && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✓ Đã thêm vào giỏ
        </div>
      )}

      {/* Nút "Thêm vào giỏ" */}
      <button
        onClick={handleAddToCart}
        className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
      >
        Thêm vào giỏ • {total.toLocaleString('vi-VN')}đ
      </button>
    </div>
  );
}
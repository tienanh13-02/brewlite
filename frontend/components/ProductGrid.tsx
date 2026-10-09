'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductImage from '@/components/ProductImage';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setError('Không tải được menu. Vui lòng thử lại.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">Đang tải menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">Menu đang trống</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="border rounded-lg p-3 hover:shadow-lg transition-shadow bg-white"
        >
          <ProductImage
            imageUrl={product.imageUrl}
            alt={product.name}
            className="bg-orange-100 h-32 rounded mb-2"
          />
          <h3 className="font-semibold text-gray-800 truncate">
            {product.name}
          </h3>
          <p className="text-orange-600 font-bold mt-1">
            {product.price.toLocaleString('vi-VN')}đ
          </p>
        </Link>
      ))}
    </div>
  );
}
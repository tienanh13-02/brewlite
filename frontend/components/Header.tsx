'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';

export default function Header() {
  const totalItems = useCart((state) => state.totalItems());

  return (
    <header className="bg-orange-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          ☕ BrewLite
        </Link>
        <nav className="flex gap-4 items-center">
          <Link href="/" className="hover:underline">
            Menu
          </Link>
          <Link href="/cart" className="hover:underline relative">
            🛒 Giỏ hàng
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
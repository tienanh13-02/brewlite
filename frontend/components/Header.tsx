'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';

export default function Header() {
  const totalItems = useCart((state) => state.totalItems());
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);

  return (
    <header className="bg-orange-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
        <Link href="/" className="text-2xl font-bold">
          ☕ BrewLite
        </Link>
        <nav className="flex gap-3 items-center flex-wrap justify-end">
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
          {user ? (
            <>
              <span className="text-sm max-w-40 truncate">{user.email}</span>
              <button
                type="button"
                onClick={logout}
                className="border border-white rounded px-3 py-1 text-sm hover:bg-white hover:text-orange-600"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
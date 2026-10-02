import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">☕ BrewLite</h1>
          <nav className="flex gap-4">
            <Link href="/" className="hover:underline">
              Menu
            </Link>
            <Link href="/cart" className="hover:underline">
              🛒 Giỏ hàng
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold p-4">Menu cà phê</h2>
        <ProductGrid />
      </section>
    </main>
  );
}
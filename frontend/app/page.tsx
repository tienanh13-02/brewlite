import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold p-4">Menu cà phê</h2>
        <ProductGrid />
      </section>
    </main>
  );
}
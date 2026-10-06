import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'Cà phê sữa', price: 35000, imageUrl: '/images/cafe-sua.jpg', stock: 50 },
  { name: 'Americano', price: 40000, imageUrl: '/images/americano.jpg', stock: 30 },
  { name: 'Cappuccino', price: 45000, imageUrl: '/images/cappuccino.jpg', stock: 20 },
  { name: 'Trà đào', price: 39000, imageUrl: '/images/tra-dao.jpg', stock: 25 },
];

async function main() {
  const existingCount = await prisma.product.count();

  if (existingCount > 0) {
    console.log(`Seed skipped: ${existingCount} product(s) already exist.`);
    return;
  }

  await prisma.product.createMany({
    data: products,
  });

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

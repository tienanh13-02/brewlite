import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed...');

  // Xóa dữ liệu cũ (cẩn thận: chỉ dùng ở dev)
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Tạo sản phẩm mẫu
  const products = await prisma.product.createMany({
    data: [
      { name: 'Cà phê sữa', price: 35000, imageUrl: '/images/cafe-sua.jpg', stock: 50 },
      { name: 'Americano', price: 40000, imageUrl: '/images/americano.jpg', stock: 30 },
      { name: 'Cappuccino', price: 45000, imageUrl: '/images/cappuccino.jpg', stock: 20 },
      { name: 'Trà đào', price: 39000, imageUrl: '/images/tra-dao.jpg', stock: 25 },
    ],
  });

  console.log(`✅ Đã tạo ${products.count} sản phẩm`);
  console.log('🌱 Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Seed lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
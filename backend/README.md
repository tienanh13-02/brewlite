# BrewLite Backend

Backend phục vụ API của BrewLite. Dự án dùng NestJS, Prisma và PostgreSQL.

## Yêu cầu

- Node.js 22 trở lên
- npm
- PostgreSQL 15

## Cấu hình môi trường

Từ thư mục gốc của dự án:

```powershell
cd backend
Copy-Item .env.example .env
```

Ví dụ `.env`:

```env
DATABASE_URL="postgresql://brewlite:brewlite@localhost:5432/brewlite?schema=public"
JWT_SECRET="một_chuỗi_khóa_có ít_nhất_32_ký tự"
JWT_EXPIRES_IN="7d"
PAYMENT_MODE="mock"
PORT=3000
```

## Chạy backend trực tiếp

```powershell
cd backend
npm install
npm run seed
npm run start:dev
```

Backend chạy tại http://localhost:3000.

## Chạy backend bằng Docker

Từ thư mục gốc của dự án:

```powershell
docker compose up --build backend
```

Docker Compose tự chạy migration, seed và khởi động backend.

## Cấu trúc API

```text
src/
├── auth/     Đăng ký, đăng nhập và JWT
├── orders/   Tạo đơn hàng và lịch sử đơn
├── payments/ Xử lý thanh toán mock
├── products/ Danh sách và chi tiết sản phẩm
└── prisma/   PrismaService
```

## Test

```powershell
cd backend
npm test
npm run test:e2e
```

> E2E test cần PostgreSQL đang chạy và `DATABASE_URL` đúng.

## Seed

```powershell
npm run seed
```

Seed tạo 4 sản phẩm mẫu khi chưa có sản phẩm nào.
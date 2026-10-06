# BrewLite

BrewLite là ứng dụng đặt cà phê trực tuyến của nhóm Công nghệ Phần mềm. Dự án gồm frontend Next.js và backend NestJS kết nối với PostgreSQL.

## Mục tiêu

- Xem danh sách sản phẩm và chi tiết sản phẩm.
- Chọn size và topping cho sản phẩm.
- Đăng ký và đăng nhập bằng JWT.
- Tạo đơn hàng và lưu lịch sử đơn hàng.
- Xử lý thanh toán theo chế độ mock.

## Kiến trúc hệ thống

```text
Browser
  │
  ├── Frontend Next.js: http://localhost:3001
  │       └── Gọi API bằng Axios
  │
  └── Backend NestJS: http://localhost:3000
          └── Kết nối PostgreSQL qua Prisma

PostgreSQL: localhost:5432
```

| Phần | Chức năng | Cổng nghệ |
|---|---|---|
| Frontend | Giao diện và gọi API | Next.js 16.3.8, React 19.2.8, TypeScript, Tailwind CSS 4, Zustand |
| Backend | API, JWT, order và payment | NestJS 12, Prisma 5, Passport |
| Database | Lưu sản phẩm, người dùng, đơn hàng và thanh toán | PostgreSQL 15 |
| Docker | Chạy toàn bộ hệ thống | Docker Compose |

## Yêu cầu

- Windows 10/11, Linux hoặc macOS
- Node.js 22 trở lên
- npm
- Docker Desktop, nếu chạy bằng Docker Compose
- Git
- PostgreSQL 15, nếu chạy trực tiếp

Kiểm tra công cụ:

```powershell
node --version
npm --version
docker --version
```

## Cách chọn cách chạy

### Chạy bằng Docker Compose

Dùng cách này khi muốn chạy toàn bộ hệ thống giống môi trường bài tập hoặc khi chưa cài PostgreSQL cục bộ.

Từ thư mục gốc của dự án, chạy:

```powershell
docker compose up --build
```

Mở:

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

Dừng hệ thống:

```powershell
docker compose down
```

Lệnh trên sẽ:

1. Tạo PostgreSQL.
2. Chạy backend.
3. Chạy migration Prisma.
4. Chạy seed để tạo 4 sản phẩm mẫu.
5. Chạy frontend.

> Docker Compose lưu dữ liệu PostgreSQL trong volume `brewlite-pgdata`. Dữ liệu vẫn được giữ khi container dừng.

### Chạy trực tiếp trên máy

Dùng cách này khi đang phát triển và muốn debug nhanh. Cần chạy PostgreSQL cục bộ hoặc chạy PostgreSQL bằng Docker rồi kết nối backend trực tiếp.

#### 1. Chạy PostgreSQL bằng Docker

Từ thư mục gốc của dự án:

```powershell
docker compose up -d postgres
```

#### 2. Cấu hình backend

```powershell
cd backend
Copy-Item .env.example .env
```

Điền đúng `DATABASE_URL` trong file `.env`:

```env
DATABASE_URL="postgresql://brewlite:brewlite@localhost:5432/brewlite?schema=public"
JWT_SECRET="một_chuỗi_khóa_có ít_nhất_32_ký tự"
JWT_EXPIRES_IN="7d"
PAYMENT_MODE="mock"
PORT=3000
```

> Không dùng mật khẩu hoặc secret thật trong file được gửi cho người khác. Chỉ dùng giá trị mẫu khi bài tập.

#### 3. Chạy backend

Mở một terminal mới:

```powershell
cd backend
npm install
npm run seed
npm run start:dev
```

Backend chạy tại http://localhost:3000.

#### 4. Chạy frontend

Mở một terminal mới:

```powershell
cd frontend
npm install
npm run dev
```},{

Frontend chạy tại http://localhost:3001.

Frontend gọi API bằng `http://localhost:3000` khi không có `NEXT_PUBLIC_API_URL`.

## Cách chạy test

### Chạy unit test

```powershell
cd backend
npm test
```

### Chạy E2E test

```powershell
cd backend
npm run test:e2e
```

E2E test cần PostgreSQL đang chạy và `DATABASE_URL` đúng.

### Chạy seed sản phẩm

```powershell
cd backend
npm run seed
```

Seed tạo 4 sản phẩm mẫu khi database chưa có sản phẩm nào. Lệnh này không xóa dữ liệu có sẵn.

## Kiểm tra hệ thống

### Kiểm tra frontend

```powershell
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing | Select-Object StatusCode
```

### Kiểm tra API products

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/products" | ConvertTo-Json -Depth 10
```

Kết quả phải gồm 4 sản phẩm.

### Đăng ký người dùng

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -ContentType "application/json" -Body '{"email":"docker@test.com","password":"123456"}'
```

## API chính

| Phương thức | Endpoint | Mục đích |
|---|---|---|
| GET | /products | Lấy danh sách sản phẩm |
| GET | /products/:id | Lấy chi tiết sản phẩm |
| POST | /auth/register | Đăng ký người dùng |
| POST | /auth/login | Đăng nhập |
| POST | /orders | Tạo đơn hàng |
| GET | /orders | Lấy lịch sử đơn hàng của người dùng |
| POST | /payments/process | Xử lý thanh toán mock |

## Cấu trúc thư mục

```text
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.mjs
│   │   └── migrations/
│   ├── src/
│   └── package.json
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    └── package.json
```

## Lưu ý cho nhóm

- Không chỉnh sửa `backend/prisma/seed.ts` để chạy Docker. File này xóa toàn bộ dữ liệu trước khi tạo sản phẩm.
- Docker chạy migration và seed trước khi khởi động backend.
- Frontend không dùng database trực tiếp. Frontend chỉ gọi API.
- Frontend Docker cần được rebuild sau khi thay đổi code frontend.
- Không dùng file `.env` để gửi cho người khác. File `.env` chứa thông tin bí mật.
- Khi có lỗi, kiểm tra Docker logs trước rồi kiểm tra API và frontend.
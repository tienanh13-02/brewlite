# BrewLite

Ứng dụng đặt cà phê không dùng tiền mặt, xây dựng theo quy trình Agile Scrum.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | Next.js (React, TypeScript), TailwindCSS, Zustand |
| Backend | NestJS (TypeScript), REST, class-validator, JWT |
| CSDL | PostgreSQL + Prisma (hoặc SQLite) |
| Thanh toán | Mock Payment Service |
| DevOps | Docker Compose, Git |

## Cấu trúc thư mục

brewlite/
├── backend/     # NestJS API
├── frontend/    # Next.js UI
├── docker-compose.yml
└── README.md

## Yêu cầu hệ thống

- Node.js >= 18
- npm >= 9
- Git
- (Tùy chọn) Docker Desktop

## Cài đặt

### 1. Clone dự án

git clone <URL_REPO>
cd brewlite

### 2. Backend

cd backend
cp .env.example .env
npm install
npm run start:dev

Backend chạy tại http://localhost:3000

### 3. Frontend

Mở terminal mới:

cd frontend
cp .env.example .env
npm install
npm run dev

Frontend chạy tại http://localhost:3001

## Chạy bằng Docker (tùy chọn)

docker-compose up --build

## Tài liệu tham khảo

- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs

## Nhóm thực hiện

- Sinh viên: [Tên em]
- Môn: Công nghệ Phần mềm
- Học kỳ: I – 2026–2027
# BrewLite Frontend

Frontend hiện tại dùng Next.js 16.3.8, React 19.2.8, TypeScript, Tailwind CSS 4, Axios và Zustand.

## Yêu cầu

- Node.js 22 trở lên
- npm

## Cài đặt

Từ thư mục gốc của dự án:

```powershell
cd frontend
npm install
```

## Chạy frontend trực tiếp

```powershell
npm run dev
```

Frontend chạy tại http://localhost:3001.

## Kết nối API

Frontend gọi backend qua Axios:

```ts
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```

Khi chạy Docker Compose, URL API được thiết lập là http://localhost:3000.

## Build production

```powershell
npm run build
npm start
```

## Cấu trúc frontend

```text
app/
├── page.tsx       Trang chính
├── products/
│   └── [id]/      Trang chi tiết sản phẩm
└── orders/
    └── [id]/      Trang lịch sử đơn hàng
components/        Header và ProductGrid
lib/               Axios client và UUID helper
store/             Zustand cart store
```

## Kiểm tra

```powershell
npm run build
```

Project frontend không có script test riêng.
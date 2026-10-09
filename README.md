# BrewLite

Ứng dụng đặt cà phê trực tuyến — Đồ án môn Công nghệ Phần mềm.

Dự án gồm **Frontend Next.js** + **Backend NestJS** + **PostgreSQL**.

---

## 📚 Mục lục

1. [Mục tiêu](#1-mục-tiêu)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Giải thích port 5432 vs 5433](#3-giải-thích-port-5432-vs-5433-quan-trọng)
4. [Yêu cầu hệ thống](#4-yêu-cầu-hệ-thống)
5. [Cách 1 — Chạy bằng Docker (khuyên dùng)](#5-cách-1--chạy-bằng-docker-khuyên-dùng)
6. [Cách 2 — Chạy trực tiếp trên máy](#6-cách-2--chạy-trực-tiếp-trên-máy-developer)
7. [Kiểm tra API — 3 cách (PowerShell / curl / Postman)](#7-kiểm-tra-api--3-cách)
8. [Thêm ảnh sản phẩm](#8-thêm-ảnh-sản-phẩm)
9. [Chạy demo end-to-end](#9-chạy-demo-end-to-end)
10. [Chạy test](#10-chạy-test)
11. [API chính](#11-api-chính)
12. [Cấu trúc thư mục](#12-cấu-trúc-thư-mục)
13. [Lưu ý cho nhóm](#13-lưu-ý-cho-nhóm)

---

## 1. Mục tiêu

- Xem danh sách và chi tiết sản phẩm.
- Chọn size và topping.
- Đăng ký / đăng nhập bằng JWT.
- Tạo đơn hàng, xem lịch sử đơn.
- Thanh toán mock (không dùng tiền thật).
- Quản lý tồn kho với optimistic locking.
- Tích điểm loyalty sau khi thanh toán.

---

## 2. Kiến trúc hệ thống

```text
┌─────────────────────────────────────────────────────────┐
│                    MÁY CỦA BẠN (HOST)                    │
│                                                         │
│   ┌──────────────┐         ┌──────────────┐            │
│   │  Frontend    │  HTTP   │   Backend    │            │
│   │  Next.js     │────────▶│   NestJS     │            │
│   │  Port 3001   │         │   Port 3000  │            │
│   └──────────────┘         └──────┬───────┘            │
│                                   │                     │
│                                   │ Prisma              │
│                                   ▼                     │
│                          ┌──────────────────┐          │
│                          │   PostgreSQL     │          │
│                          │   Port 5433      │          │
│                          │   (mapped)       │          │
│                          └──────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Công nghệ sử dụng:**

| Phần | Chức năng | Công nghệ |
|------|-----------|-----------|
| Frontend | Giao diện, gọi API | Next.js, React, TypeScript, TailwindCSS, Zustand |
| Backend | API, JWT, order, payment | NestJS, Prisma, Passport |
| Database | Lưu sản phẩm, user, đơn hàng | PostgreSQL 15 |
| DevOps | Chạy toàn hệ thống | Docker Compose |

---

## 3. Giải thích port 5432 vs 5433 (QUAN TRỌNG)

Đây là phần **gây nhầm lẫn nhiều nhất** cho sinh viên. Đọc kỹ trước khi setup.

### 3.1. Tại sao có 2 port?

PostgreSQL **mặc định chạy port 5432**. Nhưng trong đồ án này:

- **Trong Docker:** PostgreSQL chạy port **5432** (port nội bộ của container).
- **Trên máy host:** PostgreSQL được **map ra port 5433** (để tránh trùng với PostgreSQL cài sẵn trên máy).

### 3.2. Sơ đồ minh họa

```text
┌──────────────────────────────────────────────────────────┐
│ Docker Container: brewlite-postgres                       │
│                                                          │
│   PostgreSQL nghe port 5432 (BÊN TRONG container)        │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │ Port mapping
                           │ (docker-compose.yml)
                           ▼
┌──────────────────────────────────────────────────────────┐
│ Máy host (Windows/Mac/Linux)                              │
│                                                          │
│   localhost:5433  ◀───── Ai đó từ máy host kết nối       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.3. Khi nào dùng port nào?

| Tình huống | Port dùng | Ví dụ `DATABASE_URL` |
|-----------|-----------|---------------------|
| **Backend chạy trong Docker** | `postgres:5432` | `postgresql://brewlite:brewlite@postgres:5432/brewlite` |
| **Backend chạy trên máy host**, DB trong Docker | `localhost:5433` | `postgresql://brewlite:brewlite@localhost:5433/brewlite` |
| **Backend chạy trên máy host**, DB cài local | `localhost:5432` | `postgresql://brewlite:brewlite@localhost:5432/brewlite` |
| **Bạn dùng DBeaver/pgAdmin** để xem DB trong Docker | `localhost:5433` | Host: `localhost`, Port: `5433` |

### 3.4. Quy tắc ghi nhớ

> **Trong Docker network** → dùng **5432** (tên service `postgres`).
> **Từ máy host** → dùng **5433** (qua port mapping).

### 3.5. Nếu muốn đổi port mapping

Sửa `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"   # ← host:container
```

- `5433` (bên trái) = port trên máy host. Đổi thành `5434` nếu muốn.
- `5432` (bên phải) = port trong container. **KHÔNG đổi.**

Sau khi đổi, cập nhật lại `DATABASE_URL` trong `backend/.env` cho khớp.

---

## 4. Yêu cầu hệ thống

- Windows 10/11, macOS, hoặc Linux.
- **Node.js >= 22** ([tải tại đây](https://nodejs.org))
- **npm** (đi kèm Node.js)
- **Docker Desktop** ([tải tại đây](https://www.docker.com/products/docker-desktop)) — chỉ cần nếu chạy Docker.
- **Git** ([tải tại đây](https://git-scm.com))
- (Tùy chọn) **Postman** hoặc **Insomnia** để test API.

**Kiểm tra phiên bản:**

```bash
node --version    # >= v22
npm --version     # >= 10
docker --version  # >= 24
git --version     # >= 2.40
```

---

## 5. Cách 1 — Chạy bằng Docker (KHUYÊN DÙNG)

**Khi nào dùng:** Muốn chạy nhanh, không muốn cài Node/PostgreSQL lằng nhằng.

### 5.1. Chuẩn bị

**Bước 1 — Clone dự án:**

```bash
git clone <URL_REPO_CỦA_BẠN>
cd brewlite
```

**Bước 2 — Tạo file `.env` ở gốc dự án:**

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

**Bước 3 — Sinh JWT secret mạnh:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output (một chuỗi dài ~128 ký tự), dán vào `.env`:

```env
JWT_SECRET="abc123...chuỗi_dài_128_ký_tự...xyz"
```

> **Tại sao?** `JWT_SECRET` là chìa khóa ký token. Nếu dùng giá trị mặc định → hacker giả mạo được token.

### 5.2. Chạy hệ thống

**Chạy foreground (thấy log trực tiếp):**

```bash
docker compose up --build
```

**Hoặc chạy nền (trả lại terminal):**

```bash
docker compose up --build -d
```

**Lần đầu chạy mất 5–10 phút** để:
1. Tải image PostgreSQL, Node.
2. Cài dependencies backend/frontend.
3. Build code.
4. Chạy migration Prisma.
5. Chạy seed (tạo 4 sản phẩm mẫu).
6. Khởi động backend + frontend.

### 5.3. Truy cập

| Dịch vụ | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| PostgreSQL (từ máy host) | localhost:5433 |
| PostgreSQL (trong Docker) | postgres:5432 |

### 5.4. Kiểm tra container

```bash
docker compose ps
```

**Kết quả mong đợi:**

```
NAME                  STATUS
brewlite-postgres     Up (healthy)
brewlite-backend      Up
brewlite-frontend     Up
```

- `healthy` = PostgreSQL sẵn sàng nhận kết nối.
- `Up` = container đang chạy.

**Xem log:**

```bash
# Xem log tất cả
docker compose logs

# Xem log backend (theo dõi real-time)
docker compose logs -f backend

# Xem 100 dòng cuối
docker compose logs --tail=100 postgres backend frontend
```

### 5.5. Dừng hệ thống

```bash
# Dừng container, GIỮ dữ liệu
docker compose down

# Dừng và XÓA dữ liệu (cẩn thận!)
docker compose down -v
```

> **Lưu ý:** `docker compose down` giữ volume `brewlite-pgdata`. Chỉ dùng `-v` khi muốn reset database về trạng thái ban đầu.

---

## 6. Cách 2 — Chạy trực tiếp trên máy (Developer)

**Khi nào dùng:** Đang code, cần hot-reload, debug nhanh.

### 6.1. Chạy PostgreSQL bằng Docker

Chỉ chạy database, không chạy backend/frontend:

```bash
docker compose up -d postgres
```

### 6.2. Cấu hình backend

**Bước 1 — Copy file env:**

```bash
# Windows PowerShell
cd backend
Copy-Item .env.example .env

# Mac/Linux
cd backend
cp .env.example .env
```

**Bước 2 — Sửa `.env`:**

```env
# Vì backend chạy trên HOST, dùng port 5433 (mapped từ Docker)
DATABASE_URL="postgresql://brewlite:brewlite@localhost:5433/brewlite?schema=public"

# Sinh secret mạnh bằng lệnh ở mục 5.1
JWT_SECRET="chuỗi_secret_ít_nhất_32_ký_tự"

JWT_EXPIRES_IN="7d"
PAYMENT_MODE="mock"
LOYALTY_RATE=10000
PORT=3000
```

> **Quan trọng:** Dùng port **5433** (không phải 5432) vì backend chạy trên máy host, kết nối qua port mapping.

### 6.3. Chạy backend

**Mở terminal 1:**

```bash
cd backend
npm install
npm run seed         # Chỉ chạy lần đầu
npm run start:dev
```

Backend chạy tại http://localhost:3000.

**Kiểm tra:** Mở http://localhost:3000/products → thấy JSON 4 sản phẩm.

### 6.4. Chạy frontend

**Mở terminal 2:**

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại http://localhost:3001.

**Lưu ý:** Nếu không set `NEXT_PUBLIC_API_URL`, frontend mặc định gọi `http://localhost:3000`.

---

## 7. Kiểm tra API

Bạn có **4 cách** để test API. Chọn cách phù hợp với mình.

### 7.1. Cách A — File script `.ps1` (KHUYÊN DÙNG cho Windows)

**Ưu điểm:** Chạy 1 lệnh duy nhất, không lo lỗi copy paste.

**Bước 1 — Mở PowerShell, vào thư mục gốc dự án:**

```powershell
cd brewlite
```

**Bước 2 — Cho phép chạy script (chỉ cần 1 lần):**

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Bước 3 — Chạy script test:**

```powershell
.\test-api.ps1
```

**Kết quả mong đợi:**

```
🧪 Bắt đầu test API BrewLite...

1️⃣  Kiểm tra backend...
✅ Backend OK — Có 4 sản phẩm

2️⃣  Đăng ký user...
✅ Đăng ký OK: test-12345@example.com

3️⃣  Đăng nhập...
✅ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...

4️⃣  Xem info user...
✅ User ID: 1, Loyalty: 0 điểm

5️⃣  Tạo đơn hàng...
✅ Đơn hàng #1, tổng: 35000 đ

6️⃣  Thanh toán...
✅ Payment #1 — Status: SUCCESS

7️⃣  Test idempotency...
✅ Idempotency OK — Cùng payment #1

8️⃣  Xem lịch sử đơn...
✅ Bạn có 1 đơn hàng

🎉 TẤT CẢ TEST PASS!
```

---

### 7.2. Cách B — Lệnh một dòng (không dùng backtick)

Nếu bạn muốn gõ từng lệnh, **mỗi lệnh viết trên 1 dòng** để tránh lỗi xuống dòng.

**Test 1 — Kiểm tra backend:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/products"
```

**Test 2 — Đăng ký user:**

```powershell
$body = @{ email = "test@example.com"; password = "Test123!" } | ConvertTo-Json; Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -ContentType "application/json" -Body $body
```

**Test 3 — Đăng nhập + lưu token:**

```powershell
$body = @{ email = "test@example.com"; password = "Test123!" } | ConvertTo-Json; $login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -ContentType "application/json" -Body $body; $token = $login.accessToken; $headers = @{ Authorization = "Bearer $token" }; "Đã đăng nhập, token: $($token.Substring(0,30))..."
```

**Test 4 — Xem info user:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/auth/me" -Headers $headers
```

**Test 5 — Tạo đơn hàng:**

```powershell
$body = '{"items":[{"productId":1,"size":"M","topping":"Không","qty":1}]}'; Invoke-RestMethod -Uri "http://localhost:3000/orders" -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $body
```

**Test 6 — Thanh toán:**

```powershell
$headers['Idempotency-Key'] = [guid]::NewGuid().ToString(); $body = '{"orderId":1,"method":"Ví"}'; Invoke-RestMethod -Uri "http://localhost:3000/payments" -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $body
```

> ⚠️ **Lưu ý:** Mỗi lệnh trên là **1 dòng duy nhất**. Copy nguyên dòng, dán vào PowerShell, nhấn Enter. **KHÔNG** copy nhiều dòng cùng lúc.

---

### 7.3. Cách C — curl.exe (Windows 10+ / Mac / Linux)

**Kiểm tra có curl.exe:**

```powershell
curl.exe --version
```

**Cú pháp giống Linux:**

```bash
# Test 1 — Kiểm tra backend
curl.exe http://localhost:3000/products

# Test 2 — Đăng ký
curl.exe -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\"}"

# Test 3 — Đăng nhập
curl.exe -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\"}"
```

> ⚠️ **Quan trọng:** Phải dùng `curl.exe` (có đuôi `.exe`), **KHÔNG** dùng `curl` vì đó là alias của `Invoke-WebRequest`.

---

### 7.4. Cách D — Postman (Khuyên dùng cho người mới)

**Tải Postman:** https://www.postman.com/downloads/

**Quy trình 5 bước:**

**Bước 1 — Đăng ký:**

- Method: `POST`
- URL: `http://localhost:3000/auth/register`
- Body → raw → JSON:
  ```json
  {
    "email": "test@example.com",
    "password": "TestPassword123!"
  }
  ```
- Bấm **Send**.

**Bước 2 — Copy `accessToken`** trong response.

**Bước 3 — Đặt hàng:**

- Method: `POST`
- URL: `http://localhost:3000/orders`
- Headers:
  - `Authorization: Bearer <TOKEN>`
  - `Content-Type: application/json`
- Body → raw → JSON:
  ```json
  {
    "items": [
      { "productId": 1, "size": "M", "topping": "Không", "qty": 1 }
    ]
  }
  ```
- Bấm **Send**.

**Bước 4 — Thanh toán:**

- Method: `POST`
- URL: `http://localhost:3000/payments`
- Headers:
  - `Authorization: Bearer <TOKEN>`
  - `Idempotency-Key: my-unique-key-001`
  - `Content-Type: application/json`
- Body:
  ```json
  { "orderId": 1, "method": "Ví" }
  ```
- Bấm **Send**.

**Bước 5 — Test Idempotency:**

- Bấm **Send** lần nữa (giữ nguyên `Idempotency-Key`).
- Kết quả: cùng payment ID → idempotent OK.

**Postman ưu điểm:**
- Không lo copy paste.
- Lưu request để tái sử dụng.
- Visual, dễ hiểu.
- Test được nhiều case.

---

### 7.5. Bảng so sánh 4 cách

| Tiêu chí | `.ps1` | 1 dòng | curl.exe | Postman |
|----------|--------|--------|----------|---------|
| Dễ copy | ✅✅ | ✅ | ✅ | ✅✅ |
| Không lỗi backtick | ✅✅ | ✅ | ✅ | ✅✅ |
| Cần cài | ❌ | ❌ | ❌ | ✅ |
| Dễ đọc | ✅✅ | ⚠️ | ✅ | ✅✅ |
| Lưu lại | ✅✅ | ❌ | ❌ | ✅✅ |
| Cho người mới | ✅✅ | ⚠️ | ✅ | ✅✅ |

**Khuyên dùng:**
- **Windows, người mới:** File `.ps1` (cách A).
- **Quen CLI:** curl.exe (cách C).
- **Không thích CLI:** Postman (cách D).

---

## 8. Thêm ảnh sản phẩm

Frontend phục vụ file tĩnh từ `frontend/public`.

**Bước 1 — Tạo thư mục:**

```bash
mkdir -p frontend/public/images
```

**Bước 2 — Đặt ảnh vào:**

| Sản phẩm | File cần đặt |
|----------|-------------|
| Cà phê sữa | `frontend/public/images/cafe-sua.png` |
| Americano | `frontend/public/images/americano.png` |
| Cappuccino | `frontend/public/images/cappuccino.png` |
| Trà đào | `frontend/public/images/tra-dao.png` |

**Bước 3 — Kiểm tra ảnh hiển thị:**

Mở http://localhost:3001/images/cafe-sua.png → phải thấy ảnh.

**Cập nhật đường dẫn ảnh trong DB (nếu cần):**

```bash
docker compose exec -T postgres psql -U brewlite -d brewlite -c \
  "UPDATE \"Product\" SET \"imageUrl\" = '/images/cafe-sua.png' WHERE \"name\" = 'Cà phê sữa';"
```

**Rebuild frontend sau khi thêm ảnh:**

```bash
docker compose up --build -d frontend
```

---

## 9. Chạy demo end-to-end

Sau khi backend + frontend + DB đã chạy:

```bash
bash demo.sh
```

Script này tự động:
1. Đăng ký tài khoản mới.
2. Xem sản phẩm.
3. Tạo đơn hàng.
4. Thanh toán mock.
5. Kiểm tra idempotency.
6. Xem lịch sử đơn.
7. Xem chi tiết đơn.

**Không cần chỉnh sửa gì trước khi chạy.**

---

## 10. Chạy test

### 10.1. Unit test

```bash
cd backend
npm test
```

**Kết quả mong đợi:** Tất cả test pass (8+ test).

### 10.2. E2E test

```bash
cd backend
npm run test:e2e
```

**Yêu cầu:** PostgreSQL đang chạy, `DATABASE_URL` đúng.

### 10.3. Seed sản phẩm

```bash
cd backend
npm run seed
```

**Lưu ý:** Seed chỉ tạo sản phẩm khi database **chưa có sản phẩm nào**. Chạy lại không ghi đè.

---

## 11. API chính

| Method | Endpoint | Mục đích | Cần token? |
|--------|----------|----------|-----------|
| GET | `/products` | Danh sách sản phẩm | Không |
| GET | `/products/:id` | Chi tiết sản phẩm | Không |
| POST | `/auth/register` | Đăng ký | Không |
| POST | `/auth/login` | Đăng nhập | Không |
| GET | `/auth/me` | Info user | ✅ Có |
| POST | `/orders` | Tạo đơn | ✅ Có |
| GET | `/orders/me` | Lịch sử đơn | ✅ Có |
| GET | `/orders/:id` | Chi tiết đơn | ✅ Có |
| POST | `/payments` | Thanh toán | ✅ Có + `Idempotency-Key` |

---

## 12. Cấu trúc thư mục

```text
brewlite/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── demo.sh
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/          # Đăng ký, đăng nhập, JWT
│   │   ├── products/      # API sản phẩm
│   │   ├── orders/        # Đơn hàng + state machine
│   │   ├── payments/      # Thanh toán + idempotency
│   │   ├── prisma/        # PrismaService
│   │   └── config/        # Env validation
│   ├── scripts/
│   │   └── test-payment.sh
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx              # Menu
    │   ├── products/[id]/        # Chi tiết sản phẩm
    │   ├── cart/                 # Giỏ hàng
    │   ├── checkout/             # Thanh toán
    │   └── orders/               # Lịch sử + chi tiết đơn
    ├── components/
    │   ├── Header.tsx
    │   └── ProductGrid.tsx
    ├── store/
    │   └── cart.ts               # Zustand store
    ├── lib/
    │   ├── api.ts                # Axios instance
    │   └── uuid.ts               # Sinh Idempotency-Key
    ├── public/
    │   └── images/               # Ảnh sản phẩm
    ├── Dockerfile
    ├── .dockerignore
    └── package.json
```

---

## 13. Lưu ý cho nhóm

### 13.1. Về bảo mật

- ❌ **KHÔNG** commit `.env` lên Git.
- ❌ **KHÔNG** dùng mật khẩu/secret thật trong `.env.example`.
- ✅ **Sinh `JWT_SECRET` mới** cho mỗi môi trường.
- ✅ **`.gitignore`** đã chặn `.env`, `token*.txt`, `*payment*.json`.

### 13.2. Về Docker

- Docker chạy **migration + seed** trước khi start backend.
- Dữ liệu lưu trong volume `brewlite-pgdata` — **không mất khi `docker compose down`**.
- Chỉ dùng `docker compose down -v` khi muốn **reset database**.
- **Rebuild frontend** sau khi sửa code frontend: `docker compose up --build -d frontend`.

### 13.3. Về port

- **Nhớ kỹ:** Trong Docker → `5432`. Từ host → `5433`.
- Nếu đổi port mapping trong `docker-compose.yml`, phải đổi cả `DATABASE_URL`.

### 13.4. Khi có lỗi

**Thứ tự debug:**

1. **Xem log Docker:**
   ```bash
   docker compose logs --tail=100 backend
   ```
2. **Kiểm tra container:**
   ```bash
   docker compose ps
   ```
3. **Test API bằng PowerShell/curl/Postman.**
4. **Kiểm tra `.env`** đã đúng chưa.
5. **Đọc kỹ error message.**

### 13.5. Về file `seed.ts`

> ⚠️ **CẢNH BÁO:** File `backend/prisma/seed.ts` **xóa toàn bộ dữ liệu** trước khi tạo sản phẩm mẫu. Chỉ chạy khi:
> - Database trống.
> - Đang dev, không có dữ liệu quan trọng.
> - **KHÔNG** chạy trên production.

---

## 📞 Liên hệ

- **Nhóm thực hiện:** [Tên nhóm]
- **Môn:** Công nghệ Phần mềm
- **Học kỳ:** I — Năm học 2026–2027
- **Giảng viên:** [Tên thầy]

---

## 📄 License

MIT
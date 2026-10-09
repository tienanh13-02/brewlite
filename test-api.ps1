# ============================================
# BrewLite API Test Script
# Chạy: .\test-api.ps1
# ============================================

$ErrorActionPreference = "Stop"
$BASE_URL = "http://localhost:3000"

Write-Host "🧪 Bắt đầu test API BrewLite..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. Kiểm tra backend
# ============================================
Write-Host "1️⃣  Kiểm tra backend..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$BASE_URL/products"
    Write-Host "✅ Backend OK — Có $($products.Count) sản phẩm" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend không chạy. Khởi động backend trước." -ForegroundColor Red
    exit 1
}
Write-Host ""

# ============================================
# 2. Đăng ký user mới
# ============================================
Write-Host "2️⃣  Đăng ký user..." -ForegroundColor Yellow
$email = "test-$(Get-Random)@example.com"
$password = "TestPassword123!"
$registerBody = @{ email = $email; password = $password } | ConvertTo-Json

try {
    $register = Invoke-RestMethod `
        -Uri "$BASE_URL/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    Write-Host "✅ Đăng ký OK: $email" -ForegroundColor Green
} catch {
    Write-Host "❌ Đăng ký lỗi: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ============================================
# 3. Đăng nhập
# ============================================
Write-Host "3️⃣  Đăng nhập..." -ForegroundColor Yellow
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$login = Invoke-RestMethod `
    -Uri "$BASE_URL/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $login.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Host "✅ Token: $($token.Substring(0, 30))..." -ForegroundColor Green
Write-Host ""

# ============================================
# 4. Xem info user
# ============================================
Write-Host "4️⃣  Xem info user..." -ForegroundColor Yellow
$me = Invoke-RestMethod -Uri "$BASE_URL/auth/me" -Headers $headers
Write-Host "✅ User ID: $($me.id), Loyalty: $($me.loyaltyPoints) điểm" -ForegroundColor Green
Write-Host ""

# ============================================
# 5. Tạo đơn hàng
# ============================================
Write-Host "5️⃣  Tạo đơn hàng..." -ForegroundColor Yellow
$productId = [int]$products[0].id
$orderBody = @{
    items = @(
        @{
            productId = $productId
            size      = "M"
            topping   = "Không"
            qty       = 1
        }
    )
} | ConvertTo-Json -Depth 5

$order = Invoke-RestMethod `
    -Uri "$BASE_URL/orders" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json; charset=utf-8" `
    -Body $orderBody

Write-Host "✅ Đơn hàng #$($order.id), tổng: $($order.total) đ" -ForegroundColor Green
Write-Host ""

# ============================================
# 6. Thanh toán
# ============================================
Write-Host "6️⃣  Thanh toán..." -ForegroundColor Yellow
$paymentHeaders = $headers.Clone()
$paymentHeaders['Idempotency-Key'] = [guid]::NewGuid().ToString()

$paymentBody = @{ orderId = $order.id; method = "Ví" } | ConvertTo-Json

$payment1 = Invoke-RestMethod `
    -Uri "$BASE_URL/payments" `
    -Method Post `
    -Headers $paymentHeaders `
    -ContentType "application/json; charset=utf-8" `
    -Body $paymentBody

Write-Host "✅ Payment #$($payment1.id) — Status: $($payment1.status)" -ForegroundColor Green
Write-Host ""

# ============================================
# 7. Test idempotency
# ============================================
Write-Host "7️⃣  Test idempotency..." -ForegroundColor Yellow
$payment2 = Invoke-RestMethod `
    -Uri "$BASE_URL/payments" `
    -Method Post `
    -Headers $paymentHeaders `
    -ContentType "application/json; charset=utf-8" `
    -Body $paymentBody

if ($payment1.id -eq $payment2.id) {
    Write-Host "✅ Idempotency OK — Cùng payment #$($payment1.id)" -ForegroundColor Green
} else {
    Write-Host "❌ Idempotency FAIL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ============================================
# 8. Xem lịch sử đơn
# ============================================
Write-Host "8️⃣  Xem lịch sử đơn..." -ForegroundColor Yellow
$orders = Invoke-RestMethod -Uri "$BASE_URL/orders/me" -Headers $headers
Write-Host "✅ Bạn có $($orders.Count) đơn hàng" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 TẤT CẢ TEST PASS!" -ForegroundColor Cyan
Write-Host ""
Write-Host "👉 Mở trình duyệt: http://localhost:3001" -ForegroundColor White
Write-Host "   Đăng nhập: $email / $password" -ForegroundColor White
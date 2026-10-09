#!/bin/bash

# Demo end-to-end BrewLite
# Chạy: bash demo.sh

set -euo pipefail

BASE_URL="http://localhost:3000"
EMAIL="demo-$(date +%s)@brewlite.com"
PASSWORD="123456"
RESPONSE_FILE="$(mktemp)"

cleanup() {
  rm -f "$RESPONSE_FILE"
}
trap cleanup EXIT

json_field() {
  python3 -c 'import json, sys; key = sys.argv[2].lstrip("."); print(json.load(open(sys.argv[1]))[key])' "$1" "$2"
}

json_array_length() {
  python3 -c 'import json, sys; print(len(json.load(open(sys.argv[1]))))' "$1"
}

request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local -a headers=()
  
  # Tự động thêm cờ -H trước mỗi tham số header được truyền vào
  for h in "${@:4}"; do
    headers+=("-H" "$h")
  done
  
  local status

  status=$(curl -sS -o "$RESPONSE_FILE" -w '%{http_code}' \
    -X "$method" "$url" \
    -H "Content-Type: application/json" \
    "${headers[@]}" \
    --data "$body")

  if [[ ! "$status" =~ ^2[0-9][0-9]$ ]]; then
    echo "❌ Request failed: $method $url (HTTP $status)" >&2
    cat "$RESPONSE_FILE" >&2
    exit 1
  fi
}

echo "🎬 BẮT ĐẦU DEMO BREWLITE"
echo "========================"
echo ""

echo "📝 Bước 1: Đăng ký tài khoản..."
request POST "$BASE_URL/auth/register" \
  "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
TOKEN=$(json_field "$RESPONSE_FILE" ".accessToken")
echo "✅ Đã đăng ký: $EMAIL"
echo ""

echo "☕ Bước 2: Xem menu..."
request GET "$BASE_URL/products"
MENU_NAMES=$(python3 -c 'import json, sys; print("\n".join(item["name"] for item in json.load(open(sys.argv[1]))[:4]))' "$RESPONSE_FILE")
printf '%s\n' "$MENU_NAMES"
echo ""

echo "🛒 Bước 3: Tạo đơn hàng (2 Cà phê sữa size L + Trân châu)..."
request POST "$BASE_URL/orders" \
  '{"items":[{"productId":1,"size":"L","topping":"Trân châu","qty":2}]}' \
  "Authorization: Bearer $TOKEN"
ORDER_ID=$(json_field "$RESPONSE_FILE" ".id")
ORDER_TOTAL=$(json_field "$RESPONSE_FILE" ".total")
echo "✅ Đã tạo đơn #$ORDER_ID, tổng: $ORDER_TOTAL đ"
echo ""

echo "💳 Bước 4: Thanh toán bằng Ví..."
IDEMPOTENCY_KEY="demo-$(date +%s)"
request POST "$BASE_URL/payments" \
  "{\"orderId\":$ORDER_ID,\"method\":\"Ví\"}" \
  "Authorization: Bearer $TOKEN" \
  "Idempotency-Key: $IDEMPOTENCY_KEY"
PAYMENT_ID_1=$(json_field "$RESPONSE_FILE" ".id")
PAYMENT_STATUS=$(json_field "$RESPONSE_FILE" ".status")
echo "✅ Thanh toán: $PAYMENT_STATUS (#$PAYMENT_ID_1)"
echo ""

echo "🔄 Bước 5: Kiểm tra idempotency (gọi lại cùng key)..."
request POST "$BASE_URL/payments" \
  "{\"orderId\":$ORDER_ID,\"method\":\"Ví\"}" \
  "Authorization: Bearer $TOKEN" \
  "Idempotency-Key: $IDEMPOTENCY_KEY"
PAYMENT_ID_2=$(json_field "$RESPONSE_FILE" ".id")
if [[ "$PAYMENT_ID_1" != "$PAYMENT_ID_2" ]]; then
  echo "❌ Idempotency FAIL: payment IDs khác nhau" >&2
  exit 1
fi
echo "✅ Idempotency OK: cùng payment #$PAYMENT_ID_1"
echo ""

echo "📜 Bước 6: Xem lịch sử đơn..."
request GET "$BASE_URL/orders/me" "" "Authorization: Bearer $TOKEN"
HISTORY_COUNT=$(json_array_length "$RESPONSE_FILE")
echo "✅ Bạn có $HISTORY_COUNT đơn hàng"
echo ""

echo "🔍 Bước 7: Xem chi tiết đơn #$ORDER_ID..."
request GET "$BASE_URL/orders/$ORDER_ID" "" "Authorization: Bearer $TOKEN"
DETAIL_STATUS=$(json_field "$RESPONSE_FILE" ".status")
echo "✅ Trạng thái: $DETAIL_STATUS"
echo ""

echo "🎉 DEMO HOÀN TẤT!"
echo ""
echo "👉 Mở trình duyệt: http://localhost:3001"
echo "   Đăng nhập với: $EMAIL / $PASSWORD"
echo "   Xem lịch sử đơn tại: http://localhost:3001/orders"

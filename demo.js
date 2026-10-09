#!/usr/bin/env node

/**
 * BrewLite Demo Script
 * Chạy: node demo.js
 *
 * Script này tự động:
 * 1. Kiểm tra backend
 * 2. Đăng ký user mới
 * 3. Đăng nhập lấy token
 * 4. Xem info user
 * 5. Tạo đơn hàng
 * 6. Thanh toán (mock)
 * 7. Test idempotency
 * 8. Xem lịch sử đơn
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// ============================================
// Màu sắc cho terminal
// ============================================
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
};

// ============================================
// Helper functions
// ============================================
function log(emoji, message, color = 'gray') {
  console.log(`${emoji}  ${colors[color](message)}`);
}

function logStep(number, message) {
  console.log('');
  console.log(colors.yellow(`${number}️⃣  ${message}`));
}

function logSuccess(message) {
  log('✅', message, 'green');
}

function logError(message) {
  log('❌', message, 'red');
}

// ============================================
// API helpers
// ============================================
async function apiCall(method, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(
      `HTTP ${response.status}: ${data?.message || text || 'Unknown error'}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ============================================
// Main demo
// ============================================
async function main() {
  console.log('');
  console.log(colors.cyan('🎬 BẮT ĐẦU DEMO BREWLITE'));
  console.log(colors.cyan('========================'));
  console.log(colors.gray(`API: ${BASE_URL}`));

  try {
    // ==========================================
    // Bước 1: Kiểm tra backend
    // ==========================================
    logStep(1, 'Kiểm tra backend...');
    let products;
    try {
      products = await apiCall('GET', '/products');
      logSuccess(`Backend OK — Có ${products.length} sản phẩm`);
    } catch (error) {
      logError(`Backend không chạy: ${error.message}`);
      log('💡', 'Khởi động backend trước: cd backend && npm run start:dev', 'yellow');
      process.exit(1);
    }

    // ==========================================
    // Bước 2: Đăng ký user
    // ==========================================
    logStep(2, 'Đăng ký user mới...');
    const email = `demo-${Date.now()}@example.com`;
    const password = 'DemoPassword123!';

    let registerRes;
    try {
      registerRes = await apiCall('POST', '/auth/register', {
        body: { email, password },
      });
      logSuccess(`Đăng ký thành công: ${email}`);
    } catch (error) {
      logError(`Đăng ký thất bại: ${error.message}`);
      process.exit(1);
    }

    // ==========================================
    // Bước 3: Đăng nhập
    // ==========================================
    logStep(3, 'Đăng nhập...');
    let loginRes;
    try {
      loginRes = await apiCall('POST', '/auth/login', {
        body: { email, password },
      });
      const tokenShort = loginRes.accessToken.substring(0, 30);
      logSuccess(`Token: ${tokenShort}...`);
    } catch (error) {
      logError(`Đăng nhập thất bại: ${error.message}`);
      process.exit(1);
    }

    const token = loginRes.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // ==========================================
    // Bước 4: Xem info user
    // ==========================================
    logStep(4, 'Xem thông tin user...');
    const me = await apiCall('GET', '/auth/me', { headers: authHeaders });
    logSuccess(`User ID: ${me.id}, Loyalty: ${me.loyaltyPoints} điểm`);

    // ==========================================
    // Bước 5: Tạo đơn hàng
    // ==========================================
    logStep(5, 'Tạo đơn hàng...');
    const firstProduct = products[0];
    log('📦', `Sản phẩm: ${firstProduct.name} - ${firstProduct.price.toLocaleString('vi-VN')}đ`, 'gray');

    const order = await apiCall('POST', '/orders', {
      headers: authHeaders,
      body: {
        items: [
          {
            productId: firstProduct.id,
            size: 'L',
            topping: 'Trân châu',
            qty: 2,
          },
        ],
      },
    });

    logSuccess(`Đơn hàng #${order.id}, tổng: ${order.total.toLocaleString('vi-VN')}đ`);

    // ==========================================
    // Bước 6: Thanh toán
    // ==========================================
    logStep(6, 'Thanh toán...');
    const idempotencyKey = crypto.randomUUID();
    log('🔑', `Idempotency-Key: ${idempotencyKey.substring(0, 20)}...`, 'gray');

    const payment1 = await apiCall('POST', '/payments', {
      headers: {
        ...authHeaders,
        'Idempotency-Key': idempotencyKey,
      },
      body: { orderId: order.id, method: 'Ví' },
    });

    const statusColor = payment1.status === 'SUCCESS' ? 'green' : 'red';
    log('💳', `Payment #${payment1.id} — Status: ${payment1.status}`, statusColor);

    // ==========================================
    // Bước 7: Test idempotency
    // ==========================================
    logStep(7, 'Test idempotency (gọi lại cùng key)...');
    const payment2 = await apiCall('POST', '/payments', {
      headers: {
        ...authHeaders,
        'Idempotency-Key': idempotencyKey,
      },
      body: { orderId: order.id, method: 'Ví' },
    });

    if (payment1.id === payment2.id) {
      logSuccess(`Idempotency OK — Cùng payment #${payment1.id}`);
    } else {
      logError(`Idempotency FAIL: ${payment1.id} ≠ ${payment2.id}`);
      process.exit(1);
    }

    // ==========================================
    // Bước 8: Xem lịch sử đơn
    // ==========================================
    logStep(8, 'Xem lịch sử đơn...');
    const orders = await apiCall('GET', '/orders/me', {
      headers: authHeaders,
    });
    logSuccess(`Bạn có ${orders.length} đơn hàng`);

    // ==========================================
    // Bước 9: Xem loyalty points sau thanh toán
    // ==========================================
    logStep(9, 'Kiểm tra loyalty points...');
    const meAfter = await apiCall('GET', '/auth/me', {
      headers: authHeaders,
    });
    logSuccess(`Loyalty points: ${meAfter.loyaltyPoints} điểm`);

    // ==========================================
    // Hoàn tất
    // ==========================================
    console.log('');
    console.log(colors.cyan('🎉 DEMO HOÀN TẤT!'));
    console.log('');
    console.log(colors.gray('👉 Mở trình duyệt: http://localhost:3001'));
    console.log(colors.gray(`   Đăng nhập: ${email}`));
    console.log(colors.gray(`   Mật khẩu:  ${password}`));
    console.log(colors.gray(`   Lịch sử đơn: http://localhost:3001/orders`));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.log('');
    logError(`Lỗi không mong đợi: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Chạy script
main();
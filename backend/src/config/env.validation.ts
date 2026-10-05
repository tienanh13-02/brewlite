export function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Thiếu biến môi trường: ${missing.join(', ')}.\n` +
        `Vui lòng:\n` +
        `  1. Copy .env.example thành .env\n` +
        `  2. Điền giá trị thật vào .env\n` +
        `  3. Khởi động lại backend`
    );
  }

  if (process.env.JWT_SECRET!.length < 32) {
    console.warn(
      '⚠️  JWT_SECRET quá ngắn (< 32 ký tự). Nên dùng secret mạnh hơn.'
    );
  }

  // ✅ Thêm: cảnh báo nếu dùng mock payment trong production
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.PAYMENT_MODE === 'mock'
  ) {
    console.warn(
      '⚠️  Đang dùng MOCK PAYMENT trong production! ' +
        'Hãy tích hợp gateway thật.'
    );
  }
}
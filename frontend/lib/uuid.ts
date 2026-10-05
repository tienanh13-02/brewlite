export function generateIdempotencyKey(): string {
  // Sử dụng crypto.randomUUID() có sẵn trong browser
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback cho môi trường cũ
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
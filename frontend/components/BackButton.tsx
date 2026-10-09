'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = '← Quay lại' }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 text-orange-600 font-semibold hover:underline"
    >
      {label}
    </button>
  );
}

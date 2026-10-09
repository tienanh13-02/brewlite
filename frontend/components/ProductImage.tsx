'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ProductImageProps {
  imageUrl?: string;
  alt: string;
  className: string;
}

export default function ProductImage({ imageUrl, alt, className }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  return (
    <div className={`relative overflow-hidden h-48 w-full ${className}`}>
      {imageUrl && !hasError ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-orange-400 text-sm">Chưa có ảnh</span>
        </div>
      )}
    </div>
  );
}
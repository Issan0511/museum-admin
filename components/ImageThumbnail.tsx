"use client";

import { useState } from "react";

type ImageThumbnailProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ImageThumbnail({ src, alt, className = "" }: ImageThumbnailProps) {
  const [imageExists, setImageExists] = useState(true);

  if (!imageExists) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageExists(false)}
    />
  );
}

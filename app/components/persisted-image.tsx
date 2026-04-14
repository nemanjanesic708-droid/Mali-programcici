"use client";

import { useEffect, useState } from "react";

type PersistedImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel: string;
  wrapperClassName?: string;
};

export function PersistedImage({
  src,
  alt,
  className,
  fallbackLabel,
  wrapperClassName
}: PersistedImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    console.info("[Warranty Tracker] Rendering image", { src, alt });
  }, [src, alt]);

  if (!src || hasError) {
    return (
      <div className={wrapperClassName} aria-hidden="true">
        <div className="placeholder-visual">{fallbackLabel}</div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.warn("[Warranty Tracker] Image failed to load", { src, alt });
        setHasError(true);
      }}
    />
  );
}

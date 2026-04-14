"use client";

import { useEffect, useState } from "react";

type LightboxImageProps = {
  src: string;
  alt: string;
  imageClassName?: string;
  fallbackLabel: string;
  frameClassName?: string;
};

export function LightboxImage({
  src,
  alt,
  imageClassName,
  fallbackLabel,
  frameClassName
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!src || hasError) {
    return (
      <div className={frameClassName} aria-hidden="true">
        <div className="placeholder-visual">{fallbackLabel}</div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`lightbox-trigger${frameClassName ? ` ${frameClassName}` : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label={`Otvori sliku: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          onError={() => setHasError(true)}
        />
        <span className="lightbox-trigger-overlay">Pregled</span>
      </button>

      {isOpen ? (
        <div
          className="lightbox-backdrop"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setIsOpen(false)}
            aria-label="Zatvori pregled slike"
          >
            Zatvori
          </button>
          <div
            className="lightbox-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <img src={src} alt={alt} className="lightbox-image" />
          </div>
        </div>
      ) : null}
    </>
  );
}

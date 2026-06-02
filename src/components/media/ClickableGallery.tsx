"use client";

import Image from "next/image";
import { useState } from "react";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";
import { Lightbox } from "@/components/media/Lightbox";
import type { Photo } from "@/config/media-manifest";

export function ClickableGallery({
  photos,
  className = "mt-10 grid gap-3 grid-cols-2 md:grid-cols-3",
}: {
  photos: Photo[];
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  if (photos.length === 0) return null;

  return (
    <>
      <StaggerChildren className={className}>
        {photos.map((photo, i) => (
          <StaggerItem
            key={photo.src}
            className={`relative overflow-hidden rounded-xl bg-sand/30 ${
              photo.aspect === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]"
            }`}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ampliar: ${photo.alt}`}
              className="group absolute inset-0 cursor-zoom-in"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </button>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <Lightbox
        photos={photos}
        index={index}
        onClose={() => setIndex(null)}
        onNavigate={setIndex}
      />
    </>
  );
}

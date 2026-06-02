"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Lightbox } from "@/components/media/Lightbox";
import type { Photo } from "@/config/media-manifest";

export function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(0);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const go = (delta: number) => {
    setDir(delta);
    setCurrent((c) => (c + delta + photos.length) % photos.length);
  };

  const photo = photos[current];

  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-sand/30 ring-1 ring-teal-deep/10 shadow-xl">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.button
            type="button"
            key={photo.src}
            custom={dir}
            onClick={() => setLbIndex(current)}
            aria-label={`Ampliar: ${photo.alt}`}
            className="absolute inset-0 cursor-zoom-in"
            initial={reduce ? false : { opacity: 0, x: dir > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? -60 : 60 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag={photos.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover select-none"
              draggable={false}
            />
          </motion.button>
        </AnimatePresence>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        />

        <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white/90">
          <Expand className="size-4" />
        </span>

        <p className="pointer-events-none absolute bottom-4 left-5 text-sm text-white/90 drop-shadow">
          {photo.alt}
        </p>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Ir a la imagen ${i + 1}`}
              aria-current={i === current}
              onClick={() => {
                setDir(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-teal-deep"
                  : "w-2 bg-teal-deep/30 hover:bg-teal-deep/50"
              }`}
            />
          ))}
        </div>
      )}

      <Lightbox
        photos={photos}
        index={lbIndex}
        onClose={() => setLbIndex(null)}
        onNavigate={setLbIndex}
      />
    </>
  );
}

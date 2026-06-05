"use client";

import { useEffect, useRef } from "react";

export type HeroVideoProps = {
  src: string;
  poster?: string;
  className?: string;
};

/**
 * Autoplaying background hero video that also plays after client-side
 * navigation. A server-rendered `<video autoPlay>` with a child `<source>`
 * stays stuck on its poster when reached via a Next `<Link>` (the element is
 * hydrated without re-triggering load/autoplay) until a hard refresh. Forcing
 * `load()` + `play()` on mount fixes the "needs refreshing" flash, and using a
 * `src` attribute instead of a child `<source>` keeps React's source handling
 * reliable across navigations.
 */
export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.load();
    // play() rejects if the browser blocks autoplay; the muted poster remains
    // as a graceful fallback, so swallow the rejection.
    void video.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}

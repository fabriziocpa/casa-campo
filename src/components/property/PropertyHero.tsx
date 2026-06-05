import { FadeIn } from "@/components/motion/FadeIn";
import { HeroVideo } from "@/components/media/HeroVideo";
import type { Property } from "@/db/seed";

const HERO_VIDEO_BY_SLUG: Record<string, string> = {
  chalet: "/videos/chalet.mp4",
  "casa-grande": "/videos/casagrande.mp4",
};

const HERO_POSTER_BY_SLUG: Record<string, string> = {
  chalet: "/chalet/terraza.avif",
  "casa-grande": "/fotos/casa_grande.avif",
};

export function PropertyHero({ property }: { property: Property }) {
  const videoSrc = HERO_VIDEO_BY_SLUG[property.slug];
  const posterSrc = HERO_POSTER_BY_SLUG[property.slug];

  return (
    <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
      {videoSrc ? (
        <HeroVideo
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
          poster={posterSrc}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-deep via-teal to-teal-deep" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-teal-deep/25 to-black/20"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-20">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-bg/80 mb-4">
            {property.shortName}
          </p>
          <h1 className="text-5xl md:text-7xl font-semibold text-bg tracking-tight max-w-3xl drop-shadow-md">
            {property.tagline ?? property.name}
          </h1>
          {property.descriptionShort && (
            <p className="mt-6 text-lg md:text-xl text-bg/85 max-w-2xl drop-shadow">
              {property.descriptionShort}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-bg/80">
            <span>
              Capacidad{" "}
              {property.baseCapacity === property.maxCapacity
                ? property.maxCapacity
                : `${property.baseCapacity}-${property.maxCapacity}`}{" "}
              personas
            </span>
            <span aria-hidden>·</span>
            <span>
              Check-in {property.checkinTime} · Check-out{" "}
              {property.checkoutTime}
            </span>
            {property.petPolicy === "pet_friendly" && (
              <>
                <span aria-hidden>·</span>
                <span>Pet-friendly</span>
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

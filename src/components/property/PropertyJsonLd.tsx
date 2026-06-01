import type { Property, Settings } from "@/db/seed";

type PropertyJsonLdProps = {
  property: Property;
  settings: Settings;
  minPriceCents: number | null;
};

export function PropertyJsonLd({
  property,
  settings,
  minPriceCents,
}: PropertyJsonLdProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description:
      property.descriptionShort ??
      property.tagline ??
      "Refugio en el valle del río Moche.",
    url: `${siteUrl}/${property.slug}`,
    image: `${siteUrl}/${property.slug}/opengraph-image`,
    telephone: settings.whatsapp,
    email: settings.contactEmail ?? settings.adminEmail,
    address: property.addressLine
      ? {
          "@type": "PostalAddress",
          streetAddress: property.addressLine,
          addressRegion: "La Libertad",
          addressCountry: "PE",
        }
      : undefined,
    geo:
      property.latitude && property.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          }
        : undefined,
    petsAllowed: property.petPolicy !== "not_allowed",
    numberOfRooms: undefined,
    maximumAttendeeCapacity: property.maxCapacity,
  };

  if (minPriceCents !== null) {
    data.priceRange = `PEN ${(minPriceCents / 100).toFixed(2)}+`;
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

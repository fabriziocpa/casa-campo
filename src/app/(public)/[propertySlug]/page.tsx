import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/features/properties/queries";
import { getRoomsByProperty } from "@/features/rooms/queries";
import { getAmenitiesByProperty } from "@/features/amenities/queries";
import { getRulesByProperty } from "@/features/rules/queries";
import {
  getActiveModalitiesByProperty,
  getSeasonalOverridesByProperty,
} from "@/features/pricing/queries";
import { getBlockedDatesByProperty } from "@/features/blocked-dates/queries";
import { getFaqs, getSettings } from "@/features/content/queries";
import { PropertyHero } from "@/components/property/PropertyHero";
import { PropertyNarrative } from "@/components/property/PropertyNarrative";
import { RoomGrid } from "@/components/property/RoomGrid";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { CabanaSection } from "@/components/property/CabanaSection";
import { AmenityGrid } from "@/components/property/AmenityGrid";
import { PricingTable } from "@/components/property/PricingTable";
import { RulesGrid } from "@/components/property/RulesGrid";
import { LocationBlock } from "@/components/property/LocationBlock";
import { FAQ } from "@/components/property/FAQ";
import { ReservationForm } from "@/components/property/ReservationForm";
import { EventsTeaser } from "@/components/property/EventsTeaser";
import { PropertyJsonLd } from "@/components/property/PropertyJsonLd";
import { getMinPriceCents } from "@/features/pricing/queries";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);
  if (!property) notFound();

  const [
    rooms,
    amenities,
    rules,
    modalities,
    overrides,
    blocked,
    faqs,
    settings,
    minPrice,
  ] = await Promise.all([
    getRoomsByProperty(property.id),
    getAmenitiesByProperty(property.id),
    getRulesByProperty(property.id),
    getActiveModalitiesByProperty(property.id),
    getSeasonalOverridesByProperty(property.id),
    getBlockedDatesByProperty(property.id),
    getFaqs(property.id),
    getSettings(),
    getMinPriceCents(property.id),
  ]);

  return (
    <main className="min-h-screen bg-bg">
      <PropertyJsonLd
        property={property}
        settings={settings}
        minPriceCents={minPrice}
      />
      <PropertyHero property={property} />
      <PropertyNarrative property={property} />
      <RoomGrid rooms={rooms} />
      <PropertyGallery slug={property.slug} />
      {property.slug === "casa-grande" && <CabanaSection />}
      <AmenityGrid amenities={amenities} />
      <PricingTable modalities={modalities} />
      <EventsTeaser property={property} />
      <ReservationForm
        property={property}
        modalities={modalities}
        overrides={overrides}
        blockedDates={blocked.map((b) => b.date)}
        whatsapp={settings.whatsapp}
      />
      <RulesGrid rules={rules} />
      <LocationBlock property={property} />
      <FAQ faqs={faqs} />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);
  if (!property) return {};
  return {
    title: property.name,
    description: property.descriptionShort ?? property.tagline ?? property.name,
  };
}

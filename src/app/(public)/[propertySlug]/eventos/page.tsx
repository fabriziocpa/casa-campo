import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/features/properties/queries";
import { getEventPackagesByProperty } from "@/features/event-packages/queries";
import { getRulesByProperty } from "@/features/rules/queries";
import {
  getEventIncludedExcluded,
  getEventValueProps,
  getSettings,
} from "@/features/content/queries";
import { EventHero } from "@/components/events/EventHero";
import { EventValueProps } from "@/components/events/EventValueProps";
import { EventPackagesGrid } from "@/components/events/EventPackagesGrid";
import { EventIncludedList } from "@/components/events/EventIncludedList";
import { EventQuoteForm } from "@/components/events/EventQuoteForm";
import { RulesGrid } from "@/components/property/RulesGrid";

export default async function EventLandingPage({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);
  if (!property || !property.eventsEnabled) notFound();

  const [packages, valueProps, includedExcluded, rules, settings] =
    await Promise.all([
      getEventPackagesByProperty(property.id),
      getEventValueProps(property.id),
      getEventIncludedExcluded(property.id),
      getRulesByProperty(property.id),
      getSettings(),
    ]);

  return (
    <main className="min-h-screen bg-bg">
      <EventHero property={property} />
      <EventValueProps props={valueProps} />
      <EventPackagesGrid packages={packages} />
      <EventIncludedList
        included={includedExcluded.included}
        excluded={includedExcluded.excluded}
      />
      <RulesGrid rules={rules} />
      <EventQuoteForm
        property={property}
        packages={packages}
        whatsapp={settings.whatsappEvents ?? settings.whatsapp}
      />
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
  if (!property || !property.eventsEnabled) return {};
  return {
    title: `Eventos en ${property.shortName}`,
    description: `Paquetes de eventos en ${property.name}. Bodas, cumpleaños, corporativos.`,
  };
}

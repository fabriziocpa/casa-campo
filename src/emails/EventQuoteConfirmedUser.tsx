import { BrandShell } from "./components/BrandShell";
import { Heading, Body, InfoTable } from "./components/InfoTable";

export type EventQuoteConfirmedUserProps = {
  firstName: string;
  propertyName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  estimatedGuests: number;
  totalPEN: string | null;
  paymentInstructions: string;
  eventAddonsNote: string | null;
};

export default function EventQuoteConfirmedUser({
  firstName,
  propertyName,
  eventType,
  startDate,
  endDate,
  estimatedGuests,
  totalPEN,
  paymentInstructions,
  eventAddonsNote,
}: EventQuoteConfirmedUserProps) {
  return (
    <BrandShell preview={`Tu ${eventType} en ${propertyName} está confirmado`}>
      <Heading>Tu evento está confirmado</Heading>
      <Body>
        {`Hola ${firstName}, confirmamos tu ${eventType} en ${propertyName}.`}
      </Body>
      <InfoTable
        rows={[
          { label: "Casa", value: propertyName },
          { label: "Tipo", value: eventType },
          { label: "Inicio", value: startDate },
          { label: "Fin", value: endDate },
          { label: "Personas", value: String(estimatedGuests) },
          ...(totalPEN ? [{ label: "Total cotizado", value: totalPEN }] : []),
        ]}
      />
      <Body>{`Pago: ${paymentInstructions}`}</Body>
      {eventAddonsNote && <Body>{eventAddonsNote}</Body>}
    </BrandShell>
  );
}

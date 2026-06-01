import { BrandShell } from "./components/BrandShell";
import { Heading, Body, InfoTable } from "./components/InfoTable";

export type EventQuoteReceivedUserProps = {
  firstName: string;
  propertyName: string;
  eventType: string;
  tentativeDate: string | null;
  estimatedGuests: number;
  packageName: string | null;
  whatsappUrl: string;
};

export default function EventQuoteReceivedUser({
  firstName,
  propertyName,
  eventType,
  tentativeDate,
  estimatedGuests,
  packageName,
  whatsappUrl,
}: EventQuoteReceivedUserProps) {
  return (
    <BrandShell preview={`Recibimos tu solicitud de evento en ${propertyName}`}>
      <Heading>Recibimos tu solicitud</Heading>
      <Body>
        {`Hola ${firstName}, gracias por considerar ${propertyName} para tu ${eventType}. Te contactaremos pronto con la cotización detallada.`}
      </Body>
      <InfoTable
        rows={[
          { label: "Casa", value: propertyName },
          { label: "Tipo de evento", value: eventType },
          ...(tentativeDate
            ? [{ label: "Fecha tentativa", value: tentativeDate }]
            : []),
          { label: "Personas", value: String(estimatedGuests) },
          ...(packageName
            ? [{ label: "Paquete preferido", value: packageName }]
            : []),
        ]}
      />
      <Body>{`Cualquier consulta urgente: ${whatsappUrl}`}</Body>
    </BrandShell>
  );
}

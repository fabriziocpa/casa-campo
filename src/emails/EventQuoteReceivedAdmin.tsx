import { BrandShell } from "./components/BrandShell";
import { Heading, Body, InfoTable } from "./components/InfoTable";

export type EventQuoteReceivedAdminProps = {
  quoteId: string;
  propertyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventType: string;
  tentativeDate: string | null;
  estimatedGuests: number;
  packageName: string | null;
  message: string | null;
  adminUrl: string;
};

export default function EventQuoteReceivedAdmin({
  quoteId,
  propertyName,
  firstName,
  lastName,
  email,
  phone,
  eventType,
  tentativeDate,
  estimatedGuests,
  packageName,
  message,
  adminUrl,
}: EventQuoteReceivedAdminProps) {
  return (
    <BrandShell preview={`Nueva cotización ${eventType} en ${propertyName}`}>
      <Heading>Nueva cotización de evento</Heading>
      <Body>{`Llegó una nueva solicitud para ${propertyName}. Quote ID: ${quoteId}.`}</Body>
      <InfoTable
        rows={[
          { label: "Casa", value: propertyName },
          { label: "Cliente", value: `${firstName} ${lastName}` },
          { label: "Correo", value: email },
          { label: "Teléfono", value: phone },
          { label: "Tipo", value: eventType },
          ...(tentativeDate
            ? [{ label: "Fecha tentativa", value: tentativeDate }]
            : []),
          { label: "Personas", value: String(estimatedGuests) },
          ...(packageName ? [{ label: "Paquete", value: packageName }] : []),
        ]}
      />
      {message && <Body>{`Mensaje: ${message}`}</Body>}
      <Body>{`Revisar en admin: ${adminUrl}`}</Body>
    </BrandShell>
  );
}

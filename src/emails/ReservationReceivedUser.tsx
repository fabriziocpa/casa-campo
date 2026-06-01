import { BrandShell } from "./components/BrandShell";
import { Heading, Body, InfoTable } from "./components/InfoTable";

export type ReservationReceivedUserProps = {
  firstName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPEN: string;
  whatsappUrl: string;
  includesCabana?: boolean;
};

export default function ReservationReceivedUser({
  firstName,
  propertyName,
  checkIn,
  checkOut,
  guests,
  totalPEN,
  whatsappUrl,
  includesCabana = false,
}: ReservationReceivedUserProps) {
  return (
    <BrandShell preview={`Recibimos tu solicitud para ${propertyName}`}>
      <Heading>Recibimos tu solicitud</Heading>
      <Body>
        {`Hola ${firstName}, gracias por elegir ${propertyName}. Tu solicitud quedó registrada y la revisaremos pronto. Te confirmaremos por WhatsApp y coordinaremos el pago.`}
      </Body>
      <InfoTable
        rows={[
          { label: "Casa", value: propertyName },
          { label: "Check-in", value: checkIn },
          { label: "Check-out", value: checkOut },
          { label: "Personas", value: String(guests) },
          ...(includesCabana
            ? [{ label: "Cabaña", value: "Incluida (exclusiva grupos 12+)" }]
            : []),
          { label: "Total estimado", value: totalPEN },
        ]}
      />
      <Body>{`Si necesitas contactarnos antes: ${whatsappUrl}`}</Body>
    </BrandShell>
  );
}

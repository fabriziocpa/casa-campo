import { BrandShell } from "./components/BrandShell";
import { Heading, Body, InfoTable } from "./components/InfoTable";

export type ReservationReceivedAdminProps = {
  reservationId: string;
  propertyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  docType: string;
  docNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPEN: string;
  message: string | null;
  adminUrl: string;
};

export default function ReservationReceivedAdmin({
  reservationId,
  propertyName,
  firstName,
  lastName,
  email,
  phone,
  docType,
  docNumber,
  checkIn,
  checkOut,
  guests,
  totalPEN,
  message,
  adminUrl,
}: ReservationReceivedAdminProps) {
  return (
    <BrandShell preview={`Nueva solicitud ${propertyName} · ${firstName} ${lastName}`}>
      <Heading>Nueva solicitud de reserva</Heading>
      <Body>
        {`Llegó una nueva solicitud para ${propertyName}. Reservation ID: ${reservationId}.`}
      </Body>
      <InfoTable
        rows={[
          { label: "Casa", value: propertyName },
          { label: "Huésped", value: `${firstName} ${lastName}` },
          { label: "Documento", value: `${docType} ${docNumber}` },
          { label: "Correo", value: email },
          { label: "Teléfono", value: phone },
          { label: "Check-in", value: checkIn },
          { label: "Check-out", value: checkOut },
          { label: "Personas", value: String(guests) },
          { label: "Total", value: totalPEN },
        ]}
      />
      {message && <Body>{`Mensaje: ${message}`}</Body>}
      <Body>{`Revisar en admin: ${adminUrl}`}</Body>
    </BrandShell>
  );
}

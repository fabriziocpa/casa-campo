import { BrandShell } from "./components/BrandShell";
import { Heading, Body, InfoTable } from "./components/InfoTable";

export type ReservationConfirmedUserProps = {
  firstName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPEN: string;
  paymentInstructions: string;
  addressLine: string | null;
  cancellationPolicy: string;
};

export default function ReservationConfirmedUser({
  firstName,
  propertyName,
  checkIn,
  checkOut,
  guests,
  totalPEN,
  paymentInstructions,
  addressLine,
  cancellationPolicy,
}: ReservationConfirmedUserProps) {
  return (
    <BrandShell preview={`Tu reserva en ${propertyName} está confirmada`}>
      <Heading>Tu reserva está confirmada</Heading>
      <Body>
        {`Hola ${firstName}, confirmamos tu estadía en ${propertyName}. Te esperamos.`}
      </Body>
      <InfoTable
        rows={[
          { label: "Casa", value: propertyName },
          { label: "Check-in", value: checkIn },
          { label: "Check-out", value: checkOut },
          { label: "Personas", value: String(guests) },
          { label: "Total", value: totalPEN },
          ...(addressLine ? [{ label: "Dirección", value: addressLine }] : []),
        ]}
      />
      <Body>{`Pago: ${paymentInstructions}`}</Body>
      <Body>{`Política de cancelación: ${cancellationPolicy}`}</Body>
    </BrandShell>
  );
}

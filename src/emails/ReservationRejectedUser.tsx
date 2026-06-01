import { BrandShell } from "./components/BrandShell";
import { Heading, Body } from "./components/InfoTable";

export type ReservationRejectedUserProps = {
  firstName: string;
  propertyName: string;
  reason: string | null;
  whatsappUrl: string;
};

export default function ReservationRejectedUser({
  firstName,
  propertyName,
  reason,
  whatsappUrl,
}: ReservationRejectedUserProps) {
  return (
    <BrandShell preview={`Sobre tu solicitud en ${propertyName}`}>
      <Heading>No pudimos confirmar tu reserva</Heading>
      <Body>
        {`Hola ${firstName}, lamentablemente no podremos confirmar tu solicitud para ${propertyName}.`}
      </Body>
      {reason && <Body>{`Motivo: ${reason}`}</Body>}
      <Body>
        {`Si quieres explorar otras fechas o coordinar directamente, escríbenos: ${whatsappUrl}`}
      </Body>
    </BrandShell>
  );
}

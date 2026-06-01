import { BrandShell } from "./components/BrandShell";
import { Heading, Body } from "./components/InfoTable";

export type EventQuoteRejectedUserProps = {
  firstName: string;
  propertyName: string;
  reason: string | null;
  whatsappUrl: string;
};

export default function EventQuoteRejectedUser({
  firstName,
  propertyName,
  reason,
  whatsappUrl,
}: EventQuoteRejectedUserProps) {
  return (
    <BrandShell preview={`Sobre tu evento en ${propertyName}`}>
      <Heading>No podremos atender tu evento</Heading>
      <Body>
        {`Hola ${firstName}, lamentablemente no podremos atender tu solicitud en ${propertyName}.`}
      </Body>
      {reason && <Body>{`Motivo: ${reason}`}</Body>}
      <Body>{`Si quieres explorar otras fechas o nuestra otra casa, escríbenos: ${whatsappUrl}`}</Body>
    </BrandShell>
  );
}

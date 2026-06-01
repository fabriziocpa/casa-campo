import {
  Body,
  Container,
  Head,
  Html,
  Hr,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export function BrandShell({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>CasaCampo</Text>
            <Text style={subtitle}>Refugios en el valle del río Moche</Text>
          </Section>
          {children}
          <Hr style={hr} />
          <Section>
            <Text style={footer}>
              CasaCampo · La Libertad, Perú · WhatsApp +51 902 021 725
            </Text>
            <Text style={footer}>
              Si no esperabas este correo, ignóralo. Si tienes dudas,
              respóndenos.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#faf7f2",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#111111",
  margin: 0,
  padding: "32px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  margin: "0 auto",
  padding: 32,
  maxWidth: 560,
  border: "1px solid #d7cfc0",
};

const header = { paddingBottom: 16 };

const brand = {
  color: "#0f3a36",
  fontSize: 22,
  fontWeight: 600,
  margin: 0,
};

const subtitle = {
  color: "#6b6055",
  fontSize: 13,
  margin: "4px 0 0",
};

const hr = {
  border: "none",
  borderTop: "1px solid #ebe1d2",
  margin: "28px 0 16px",
};

const footer = {
  color: "#6b6055",
  fontSize: 12,
  margin: "4px 0",
  lineHeight: 1.5,
};

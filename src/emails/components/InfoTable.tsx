import { Section, Text } from "@react-email/components";

export function InfoTable({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <Section style={{ marginTop: 16 }}>
      {rows.map(({ label, value }) => (
        <table key={label} width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={labelCell}>{label}</td>
              <td style={valueCell}>{value}</td>
            </tr>
          </tbody>
        </table>
      ))}
    </Section>
  );
}

export function Heading({ children }: { children: string }) {
  return <Text style={heading}>{children}</Text>;
}

export function Body({ children }: { children: string }) {
  return <Text style={body}>{children}</Text>;
}

const heading = {
  color: "#0f3a36",
  fontSize: 22,
  fontWeight: 600,
  margin: "0 0 8px",
  lineHeight: 1.2,
};

const body = {
  color: "#111111",
  fontSize: 14,
  lineHeight: 1.6,
  margin: "8px 0",
};

const labelCell = {
  color: "#6b6055",
  fontSize: 13,
  padding: "6px 0",
  width: "40%",
  verticalAlign: "top" as const,
};

const valueCell = {
  color: "#111111",
  fontSize: 14,
  fontWeight: 500,
  padding: "6px 0",
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};

import { ImageResponse } from "next/og";
import { getPropertyBySlug } from "@/features/properties/queries";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);

  const name = property?.name ?? "CasaCampo";
  const tagline = property?.tagline ?? "Refugios en el valle del río Moche";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #0f3a36 0%, #1f6f63 60%, #b89767 100%)",
          color: "#faf7f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7, letterSpacing: 4 }}>
          CASACAMPO
        </div>
        <div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 32,
              opacity: 0.85,
              marginTop: 12,
              fontStyle: "italic",
            }}
          >
            {tagline}
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.7 }}>
          Río Moche · La Libertad, Perú
        </div>
      </div>
    ),
    size,
  );
}

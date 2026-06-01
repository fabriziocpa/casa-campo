import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CasaCampo — Refugios en el valle del río Moche";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
            "linear-gradient(135deg, #0f3a36 0%, #1f6f63 50%, #b89767 100%)",
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
              fontSize: 92,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Refugios en
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            el valle
          </div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.8 }}>
          Río Moche · La Libertad, Perú
        </div>
      </div>
    ),
    size,
  );
}

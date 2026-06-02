import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Placeholder for Broadsheet LDO — swap via next/font/local when file arrives in /public/fonts/
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Casa Campo",
  },
  description:
    "Refugios rurales en el valle del río Moche, La Libertad. Alquiler de casas de campo para escapar de la ciudad.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

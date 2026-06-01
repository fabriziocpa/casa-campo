export const siteConfig = {
  name: "CasaCampo",
  description: "Refugios rurales en el valle del río Moche, La Libertad.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://casacampo.pe",
  ogImage: "/og/default.jpg",
  links: {
    instagram: "https://instagram.com/casacampoquirihuac",
  },
} as const;

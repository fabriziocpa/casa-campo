import Image from "next/image";
import Link from "next/link";
import { getActiveProperties } from "@/features/properties/queries";
import { getSettings } from "@/features/content/queries";
import { whatsappUrl } from "@/lib/whatsapp";
import { MobileNav } from "./MobileNav";

export async function PublicHeader() {
  const [props, settings] = await Promise.all([
    getActiveProperties(),
    getSettings(),
  ]);

  const waHref = whatsappUrl(
    settings.whatsapp,
    "Hola CasaCampo, me gustaría más información.",
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/80 border-b border-line/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="CasaCampo — Inicio"
          className="flex items-center gap-2"
        >
          <Image
            src="/logo/Logo.svg"
            alt="CasaCampo"
            width={40}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href="/"
            className="text-ink/80 hover:text-teal-deep transition-colors"
          >
            Inicio
          </Link>
          {props.map((p) => (
            <Link
              key={p.id}
              href={`/${p.slug}`}
              className="text-ink/80 hover:text-teal-deep transition-colors"
            >
              {p.shortName}
            </Link>
          ))}
          <span aria-hidden className="h-4 w-px bg-line/80" />
          <Link
            href="/galeria"
            className="text-ink/80 hover:text-teal-deep transition-colors"
          >
            Galería
          </Link>
          <Link
            href="/contacto"
            className="text-ink/80 hover:text-teal-deep transition-colors"
          >
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center rounded-full bg-teal-deep text-bg px-4 py-2 text-sm font-medium hover:bg-teal transition-colors"
          >
            Reservar por WhatsApp
          </a>
          <MobileNav properties={props} waHref={waHref} />
        </div>
      </div>
    </header>
  );
}

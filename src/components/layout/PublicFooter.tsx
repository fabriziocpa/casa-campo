import Link from "next/link";
import { getActiveProperties } from "@/features/properties/queries";
import { getSettings } from "@/features/content/queries";
import { whatsappUrl } from "@/lib/whatsapp";

export async function PublicFooter() {
  const [props, settings] = await Promise.all([
    getActiveProperties(),
    getSettings(),
  ]);

  return (
    <footer className="bg-teal-deep text-bg">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="space-y-3">
          <p className="font-semibold text-xl tracking-tight">CasaCampo</p>
          <p className="text-sm text-bg/70 max-w-xs">
            Refugios rurales en el valle del río Moche. Desconecta, descansa,
            vuelve renovado.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-bg/90">Propiedades</p>
          <ul className="space-y-2 text-sm text-bg/70">
            {props.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${p.slug}`}
                  className="hover:text-bg transition-colors"
                >
                  {p.name}
                </Link>
              </li>
            ))}
            {props.some((p) => p.eventsEnabled) && (
              <li className="pt-2">
                <Link
                  href={`/${props.find((p) => p.eventsEnabled)?.slug}/eventos`}
                  className="hover:text-bg transition-colors"
                >
                  Eventos en Casa Principal
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-bg/90">Contacto</p>
          <ul className="space-y-2 text-sm text-bg/70">
            <li>
              <a
                href={whatsappUrl(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bg transition-colors"
              >
                WhatsApp {settings.whatsapp}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:text-bg transition-colors"
              >
                {settings.contactEmail}
              </a>
            </li>
            <li>Atención: {settings.attentionHours}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-bg/90">Síguenos</p>
          <ul className="space-y-2 text-sm text-bg/70">
            {settings.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bg transition-colors"
                >
                  Instagram · @{settings.instagram}
                </a>
              </li>
            )}
            {settings.tiktok && (
              <li>
                <a
                  href={`https://tiktok.com/@${settings.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bg transition-colors"
                >
                  TikTok · @{settings.tiktok}
                </a>
              </li>
            )}
            {settings.facebook && (
              <li>
                <a
                  href={`https://facebook.com/${settings.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bg transition-colors"
                >
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-bg/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-bg/50">
          <p>© {new Date().getFullYear()} CasaCampo. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <Link href="/politicas" className="hover:text-bg transition-colors">
              Políticas
            </Link>
            <Link href="/galeria" className="hover:text-bg transition-colors">
              Galería
            </Link>
            <Link href="/contacto" className="hover:text-bg transition-colors">
              Contacto
            </Link>
            <Link href="/auth/login" className="hover:text-bg transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

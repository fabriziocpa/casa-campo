"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavProperty = { id: string; slug: string; shortName: string };

export function MobileNav({
  properties,
  waHref,
}: {
  properties: NavProperty[];
  waHref: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menú"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 text-base">
          <Link
            href="/"
            onClick={close}
            className="py-2 text-ink/80 hover:text-teal-deep transition-colors"
          >
            Inicio
          </Link>
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/${p.slug}`}
              onClick={close}
              className="py-2 text-ink/80 hover:text-teal-deep transition-colors"
            >
              {p.shortName}
            </Link>
          ))}
          <Link
            href="/galeria"
            onClick={close}
            className="py-2 text-ink/80 hover:text-teal-deep transition-colors"
          >
            Galería
          </Link>
          <Link
            href="/contacto"
            onClick={close}
            className="py-2 text-ink/80 hover:text-teal-deep transition-colors"
          >
            Contacto
          </Link>
        </nav>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="mx-4 mt-2 inline-flex items-center justify-center rounded-full bg-teal-deep text-bg px-4 py-2.5 text-sm font-medium hover:bg-teal transition-colors"
        >
          Reservar por WhatsApp
        </a>
      </SheetContent>
    </Sheet>
  );
}

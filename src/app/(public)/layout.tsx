import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <PublicHeader />
      {children}
      <PublicFooter />
      <WhatsAppFloating />
      <Toaster position="top-center" richColors />
    </LenisProvider>
  );
}

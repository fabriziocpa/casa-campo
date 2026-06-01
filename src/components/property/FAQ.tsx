import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "@/components/motion/FadeIn";

export function FAQ({ faqs }: { faqs: Array<{ q: string; a: string }> }) {
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Preguntas frecuentes
          </h2>
        </FadeIn>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-ink/75 leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

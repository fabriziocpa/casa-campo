"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionRootProps = React.ComponentProps<typeof AccordionPrimitive.Root> & {
  /** Compatibility props, ignored — base-ui handles single/collapsible natively. */
  type?: "single" | "multiple";
  collapsible?: boolean;
};

function Accordion({
  type,
  collapsible,
  multiple,
  className,
  ...props
}: AccordionRootProps) {
  void collapsible;
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      multiple={multiple ?? type === "multiple"}
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-line/60 last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 py-5 text-left text-base font-medium text-ink transition-colors hover:text-teal-deep [&[data-panel-open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="size-4 shrink-0 text-ink/50 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm transition-[height] duration-200 ease-out [&[data-starting-style]]:h-0 [&[data-ending-style]]:h-0",
        className,
      )}
      {...props}
    >
      <div className="pb-5 pt-0 leading-relaxed text-ink/75">{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

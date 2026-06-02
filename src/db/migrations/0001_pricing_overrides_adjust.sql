ALTER TABLE "seasonal_overrides" ADD COLUMN "adjust_type" text DEFAULT 'absolute' NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonal_overrides" ALTER COLUMN "price_cents" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "seasonal_overrides" ADD COLUMN "percent" integer;

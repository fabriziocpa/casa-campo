CREATE TYPE "public"."block_reason" AS ENUM('reservation', 'event', 'event_dependency', 'manual');--> statement-breakpoint
CREATE TYPE "public"."doc_type" AS ENUM('DNI', 'CE', 'PASSPORT');--> statement-breakpoint
CREATE TYPE "public"."event_quote_status" AS ENUM('pending', 'in_conversation', 'quoted', 'confirmed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"icon" text,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"date" date NOT NULL,
	"reason" "block_reason" NOT NULL,
	"reservation_id" uuid,
	"event_quote_id" uuid,
	"source_property_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" text NOT NULL,
	"max_guests" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"includes_lodging_capacity" integer NOT NULL,
	"vendor_days_before" integer DEFAULT 1 NOT NULL,
	"dismount_days_after" integer DEFAULT 1 NOT NULL,
	"guest_start_time" text DEFAULT '10:00' NOT NULL,
	"guest_end_time" text DEFAULT '19:00' NOT NULL,
	"parking_property_id" uuid,
	"parking_cars_capacity" integer,
	"notes" text,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"package_id" uuid,
	"event_type" text NOT NULL,
	"tentative_date" date,
	"estimated_guests" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text,
	"consent" boolean DEFAULT false NOT NULL,
	"status" "event_quote_status" DEFAULT 'pending' NOT NULL,
	"quoted_total_cents" integer,
	"confirmed_start_date" date,
	"confirmed_end_date" date,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid,
	"kind" "media_kind" DEFAULT 'image' NOT NULL,
	"storage_path" text NOT NULL,
	"poster_path" text,
	"alt" text NOT NULL,
	"section" text DEFAULT 'gallery' NOT NULL,
	"room_id" uuid,
	"tags" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_modalities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"day_mask" integer NOT NULL,
	"capacity_tier" integer,
	"price_cents" integer NOT NULL,
	"min_nights" integer DEFAULT 1 NOT NULL,
	"package_nights" integer,
	"priority" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"tagline" text,
	"description_short" text,
	"description_long" text,
	"address_line" text,
	"latitude" text,
	"longitude" text,
	"checkin_time" text DEFAULT '15:00' NOT NULL,
	"checkout_time" text DEFAULT '12:00' NOT NULL,
	"full_checkin_time" text,
	"full_checkout_time" text,
	"base_capacity" integer NOT NULL,
	"max_capacity" integer NOT NULL,
	"extra_person_cents" integer DEFAULT 0 NOT NULL,
	"min_nights_default" integer DEFAULT 1 NOT NULL,
	"pet_policy" text DEFAULT 'not_allowed' NOT NULL,
	"pet_policy_note" text,
	"events_enabled" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"modality_id" uuid,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"nights" integer NOT NULL,
	"guests" integer NOT NULL,
	"capacity_tier" integer,
	"doc_type" "doc_type" NOT NULL,
	"doc_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text,
	"consent" boolean DEFAULT false NOT NULL,
	"price_breakdown" jsonb NOT NULL,
	"total_cents" integer NOT NULL,
	"currency" text DEFAULT 'PEN' NOT NULL,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"floor" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"beds" jsonb NOT NULL,
	"has_bathroom" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"category" text NOT NULL,
	"body" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasonal_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"modality_id" uuid,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"price_cents" integer NOT NULL,
	"min_nights" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"whatsapp_events" text,
	"contact_email" text NOT NULL,
	"attention_hours" text DEFAULT '9:00 - 21:00' NOT NULL,
	"instagram" text,
	"tiktok" text,
	"facebook" text,
	"payment_methods" jsonb NOT NULL,
	"cancellation_policy" text NOT NULL,
	"event_addons_note" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "amenities" ADD CONSTRAINT "amenities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_source_property_id_properties_id_fk" FOREIGN KEY ("source_property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_packages" ADD CONSTRAINT "event_packages_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_packages" ADD CONSTRAINT "event_packages_parking_property_id_properties_id_fk" FOREIGN KEY ("parking_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_quotes" ADD CONSTRAINT "event_quotes_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_quotes" ADD CONSTRAINT "event_quotes_package_id_event_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."event_packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_modalities" ADD CONSTRAINT "pricing_modalities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_modality_id_pricing_modalities_id_fk" FOREIGN KEY ("modality_id") REFERENCES "public"."pricing_modalities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_overrides" ADD CONSTRAINT "seasonal_overrides_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_overrides" ADD CONSTRAINT "seasonal_overrides_modality_id_pricing_modalities_id_fk" FOREIGN KEY ("modality_id") REFERENCES "public"."pricing_modalities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "amenities_property_idx" ON "amenities" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blocked_dates_property_date_idx" ON "blocked_dates" USING btree ("property_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "content_scope_key_idx" ON "content" USING btree ("property_id","key");--> statement-breakpoint
CREATE INDEX "event_packages_property_idx" ON "event_packages" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "event_quotes_property_idx" ON "event_quotes" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "event_quotes_status_idx" ON "event_quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_property_idx" ON "media" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "pricing_modalities_property_idx" ON "pricing_modalities" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reservations_property_idx" ON "reservations" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rooms_property_idx" ON "rooms" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "rules_property_idx" ON "rules" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "seasonal_overrides_property_idx" ON "seasonal_overrides" USING btree ("property_id");
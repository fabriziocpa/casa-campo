import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---- Enums ----

export const reservationStatus = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
]);

export const eventQuoteStatus = pgEnum("event_quote_status", [
  "pending",
  "in_conversation",
  "quoted",
  "confirmed",
  "rejected",
  "cancelled",
]);

export const docType = pgEnum("doc_type", ["DNI", "CE", "PASSPORT"]);

export const mediaKind = pgEnum("media_kind", ["image", "video"]);

export const blockReason = pgEnum("block_reason", [
  "reservation",
  "event",
  "event_dependency",
  "manual",
]);

// ---- Properties ----

export const properties = pgTable(
  "properties",
  {
    id:               uuid("id").defaultRandom().primaryKey(),
    slug:             text("slug").notNull().unique(),
    name:             text("name").notNull(),
    shortName:        text("short_name").notNull(),
    tagline:          text("tagline"),
    descriptionShort: text("description_short"),
    descriptionLong:  text("description_long"),
    addressLine:      text("address_line"),
    latitude:         text("latitude"),
    longitude:        text("longitude"),
    checkinTime:      text("checkin_time").notNull().default("15:00"),
    checkoutTime:     text("checkout_time").notNull().default("12:00"),
    fullCheckinTime:  text("full_checkin_time"),
    fullCheckoutTime: text("full_checkout_time"),
    baseCapacity:     integer("base_capacity").notNull(),
    maxCapacity:      integer("max_capacity").notNull(),
    extraPersonCents: integer("extra_person_cents").notNull().default(0),
    minNightsDefault: integer("min_nights_default").notNull().default(1),
    petPolicy:        text("pet_policy").notNull().default("not_allowed"),
    petPolicyNote:    text("pet_policy_note"),
    eventsEnabled:    boolean("events_enabled").notNull().default(false),
    active:           boolean("active").notNull().default(true),
    order:            integer("order").notNull().default(0),
    createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("properties_slug_idx").on(t.slug)]
);

// ---- Rooms ----

export const rooms = pgTable(
  "rooms",
  {
    id:          uuid("id").defaultRandom().primaryKey(),
    propertyId:  uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    floor:       text("floor").notNull(),
    name:        text("name").notNull(),
    description: text("description"),
    beds:        jsonb("beds").notNull(),
    hasBathroom: boolean("has_bathroom").notNull().default(true),
    order:       integer("order").notNull().default(0),
    createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("rooms_property_idx").on(t.propertyId)]
);

// ---- Amenities ----

export const amenities = pgTable(
  "amenities",
  {
    id:         uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    name:       text("name").notNull(),
    category:   text("category"),
    icon:       text("icon"),
    order:      integer("order").notNull().default(0),
    active:     boolean("active").notNull().default(true),
  },
  (t) => [index("amenities_property_idx").on(t.propertyId)]
);

// ---- Rules ----

export const rules = pgTable(
  "rules",
  {
    id:         uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    category:   text("category").notNull(),
    body:       text("body").notNull(),
    order:      integer("order").notNull().default(0),
    active:     boolean("active").notNull().default(true),
  },
  (t) => [index("rules_property_idx").on(t.propertyId)]
);

// ---- Pricing modalities ----

export const pricingModalities = pgTable(
  "pricing_modalities",
  {
    id:            uuid("id").defaultRandom().primaryKey(),
    propertyId:    uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    name:          text("name").notNull(),
    kind:          text("kind").notNull().$type<"per_night" | "full_package">(),
    dayMask:       integer("day_mask").notNull(),
    capacityTier:  integer("capacity_tier"),
    priceCents:    integer("price_cents").notNull(),
    minNights:     integer("min_nights").notNull().default(1),
    packageNights: integer("package_nights"),
    priority:      integer("priority").notNull().default(0),
    active:        boolean("active").notNull().default(true),
    createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pricing_modalities_property_idx").on(t.propertyId)]
);

// ---- Seasonal overrides ----

export const seasonalOverrides = pgTable(
  "seasonal_overrides",
  {
    id:         uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    modalityId: uuid("modality_id").references(() => pricingModalities.id, { onDelete: "cascade" }),
    name:       text("name").notNull(),
    startDate:  date("start_date").notNull(),
    endDate:    date("end_date").notNull(),
    // adjustType "absolute": priceCents is the override price.
    // adjustType "percent":  percent is applied to the base modality price
    //                        (priceCents ignored / kept 0); result rounds to
    //                        whole sol so displayed prices stay .00.
    adjustType: text("adjust_type").notNull().default("absolute").$type<"absolute" | "percent">(),
    priceCents: integer("price_cents").notNull().default(0),
    percent:    integer("percent"),
    minNights:  integer("min_nights"),
    active:     boolean("active").notNull().default(true),
    createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("seasonal_overrides_property_idx").on(t.propertyId)]
);

// ---- Reservations ----

export const reservations = pgTable(
  "reservations",
  {
    id:             uuid("id").defaultRandom().primaryKey(),
    propertyId:     uuid("property_id").notNull().references(() => properties.id, { onDelete: "restrict" }),
    modalityId:     uuid("modality_id").references(() => pricingModalities.id, { onDelete: "set null" }),
    checkIn:        date("check_in").notNull(),
    checkOut:       date("check_out").notNull(),
    nights:         integer("nights").notNull(),
    guests:         integer("guests").notNull(),
    capacityTier:   integer("capacity_tier"),
    docType:        docType("doc_type").notNull(),
    docNumber:      text("doc_number").notNull(),
    firstName:      text("first_name").notNull(),
    lastName:       text("last_name").notNull(),
    email:          text("email").notNull(),
    phone:          text("phone").notNull(),
    message:        text("message"),
    consent:        boolean("consent").notNull().default(false),
    priceBreakdown: jsonb("price_breakdown").notNull(),
    totalCents:     integer("total_cents").notNull(),
    currency:       text("currency").notNull().default("PEN"),
    status:         reservationStatus("status").notNull().default("pending"),
    adminNotes:     text("admin_notes"),
    createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt:      timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("reservations_property_idx").on(t.propertyId),
    index("reservations_status_idx").on(t.status),
  ]
);

// ---- Blocked dates ----

export const blockedDates = pgTable(
  "blocked_dates",
  {
    id:               uuid("id").defaultRandom().primaryKey(),
    propertyId:       uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    date:             date("date").notNull(),
    reason:           blockReason("reason").notNull(),
    reservationId:    uuid("reservation_id").references(() => reservations.id, { onDelete: "cascade" }),
    eventQuoteId:     uuid("event_quote_id"),
    sourcePropertyId: uuid("source_property_id").references(() => properties.id, { onDelete: "cascade" }),
    notes:            text("notes"),
    createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("blocked_dates_property_date_idx").on(t.propertyId, t.date)]
);

// ---- Event packages ----

export const eventPackages = pgTable(
  "event_packages",
  {
    id:                     uuid("id").defaultRandom().primaryKey(),
    propertyId:             uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    name:                   text("name").notNull(),
    maxGuests:              integer("max_guests").notNull(),
    priceCents:             integer("price_cents").notNull(),
    includesLodgingCapacity: integer("includes_lodging_capacity").notNull(),
    vendorDaysBefore:       integer("vendor_days_before").notNull().default(1),
    dismountDaysAfter:      integer("dismount_days_after").notNull().default(1),
    guestStartTime:         text("guest_start_time").notNull().default("10:00"),
    guestEndTime:           text("guest_end_time").notNull().default("19:00"),
    parkingPropertyId:      uuid("parking_property_id").references(() => properties.id, { onDelete: "set null" }),
    parkingCarsCapacity:    integer("parking_cars_capacity"),
    notes:                  text("notes"),
    order:                  integer("order").notNull().default(0),
    active:                 boolean("active").notNull().default(true),
  },
  (t) => [index("event_packages_property_idx").on(t.propertyId)]
);

// ---- Event quotes ----

export const eventQuotes = pgTable(
  "event_quotes",
  {
    id:                 uuid("id").defaultRandom().primaryKey(),
    propertyId:         uuid("property_id").notNull().references(() => properties.id, { onDelete: "restrict" }),
    packageId:          uuid("package_id").references(() => eventPackages.id, { onDelete: "set null" }),
    eventType:          text("event_type").notNull(),
    tentativeDate:      date("tentative_date"),
    estimatedGuests:    integer("estimated_guests").notNull(),
    firstName:          text("first_name").notNull(),
    lastName:           text("last_name").notNull(),
    email:              text("email").notNull(),
    phone:              text("phone").notNull(),
    message:            text("message"),
    consent:            boolean("consent").notNull().default(false),
    status:             eventQuoteStatus("status").notNull().default("pending"),
    quotedTotalCents:   integer("quoted_total_cents"),
    confirmedStartDate: date("confirmed_start_date"),
    confirmedEndDate:   date("confirmed_end_date"),
    adminNotes:         text("admin_notes"),
    createdAt:          timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt:          timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("event_quotes_property_idx").on(t.propertyId),
    index("event_quotes_status_idx").on(t.status),
  ]
);

// ---- Media ----

export const media = pgTable(
  "media",
  {
    id:          uuid("id").defaultRandom().primaryKey(),
    propertyId:  uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
    kind:        mediaKind("kind").notNull().default("image"),
    storagePath: text("storage_path").notNull(),
    posterPath:  text("poster_path"),
    alt:         text("alt").notNull(),
    section:     text("section").notNull().default("gallery"),
    roomId:      uuid("room_id").references(() => rooms.id, { onDelete: "set null" }),
    tags:        jsonb("tags"),
    order:       integer("order").notNull().default(0),
    width:       integer("width"),
    height:      integer("height"),
    createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("media_property_idx").on(t.propertyId)]
);

// ---- Content ----

export const content = pgTable(
  "content",
  {
    id:         uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
    key:        text("key").notNull(),
    value:      text("value").notNull(),
    updatedAt:  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("content_scope_key_idx").on(t.propertyId, t.key)]
);

// ---- Settings ----

export const settings = pgTable("settings", {
  id:                 uuid("id").defaultRandom().primaryKey(),
  adminEmail:         text("admin_email").notNull(),
  whatsapp:           text("whatsapp").notNull(),
  whatsappEvents:     text("whatsapp_events"),
  contactEmail:       text("contact_email").notNull(),
  attentionHours:     text("attention_hours").notNull().default("9:00 - 21:00"),
  instagram:          text("instagram"),
  tiktok:             text("tiktok"),
  facebook:           text("facebook"),
  paymentMethods:     jsonb("payment_methods").notNull(),
  cancellationPolicy: text("cancellation_policy").notNull(),
  eventAddonsNote:    text("event_addons_note"),
  updatedAt:          timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

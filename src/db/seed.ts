// In-memory seed data + shared row types.
//
// Supabase is live; these arrays now double as the in-memory fallback the public
// query layer (src/features/*/queries.ts) returns when a DB read fails or is empty.
// TODO: extract into a standalone `pnpm db:seed` script and move the row types
// next to schema.ts, once the fallback pattern is retired.
//
// UUIDs are deterministic placeholders so FKs remain stable across reloads.

import type { InferSelectModel } from "drizzle-orm";
import {
  amenities,
  blockedDates,
  content,
  eventPackages,
  eventQuotes,
  media,
  pricingModalities,
  properties,
  reservations,
  rooms,
  rules,
  seasonalOverrides,
  settings,
} from "./schema";

export type Property = InferSelectModel<typeof properties>;
export type Room = InferSelectModel<typeof rooms>;
export type Amenity = InferSelectModel<typeof amenities>;
export type Rule = InferSelectModel<typeof rules>;
export type PricingModality = InferSelectModel<typeof pricingModalities>;
export type SeasonalOverride = InferSelectModel<typeof seasonalOverrides>;
export type EventPackage = InferSelectModel<typeof eventPackages>;
export type Media = InferSelectModel<typeof media>;
export type Content = InferSelectModel<typeof content>;
export type BlockedDate = InferSelectModel<typeof blockedDates>;
export type Settings = InferSelectModel<typeof settings>;
export type Reservation = InferSelectModel<typeof reservations>;
export type EventQuote = InferSelectModel<typeof eventQuotes>;

export type Bed = { size: string; count: number };

const now = new Date("2026-01-01T00:00:00Z");

const CHALET_ID = "11111111-1111-1111-1111-111111111111";
const CASA_GRANDE_ID = "22222222-2222-2222-2222-222222222222";

// ============================================================
// Properties
// ============================================================

export const PROPERTIES: Property[] = [
  {
    id: CHALET_ID,
    slug: "chalet",
    name: "Chalet",
    shortName: "Chalet",
    tagline: "Tu refugio privado en el valle",
    descriptionShort:
      "Un chalet íntimo en el corazón del valle, reservado solo para los tuyos.",
    descriptionLong:
      "Un refugio íntimo para desconectar sin prisa. Naturaleza, vistas a las montañas y un espacio reservado solo para tu grupo. Cocina equipada, terraza al exterior, parrilla a leña y silencio absoluto al caer la noche.",
    addressLine:
      "Km 23.5 Carretera a Simbal (antes del peaje). Sector Santa Rosa / Quirihuac",
    latitude: "-7.972500",
    longitude: "-78.860800",
    checkinTime: "15:00",
    checkoutTime: "12:00",
    fullCheckinTime: "09:00",
    fullCheckoutTime: "18:00",
    baseCapacity: 5,
    maxCapacity: 5,
    extraPersonCents: 0,
    minNightsDefault: 1,
    petPolicy: "by_request",
    petPolicyNote: "Mascotas solo con acuerdo previo con el anfitrión.",
    eventsEnabled: false,
    active: true,
    order: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: CASA_GRANDE_ID,
    slug: "casa-grande",
    name: "Casa Principal",
    shortName: "Casa Principal",
    tagline: "Donde la calma se vuelve hogar",
    descriptionShort:
      "Casa de campo con acceso privado al río Moche, pensada al detalle.",
    descriptionLong:
      "Casa de campo con acceso privado al río, piscina y diseño cálido de cabaña. El espacio entero, reservado para tu familia o celebración. Áreas al aire libre para reunirse, naturaleza en cada rincón y el sonido del río como banda sonora.",
    addressLine:
      "Quirihuac, valle del río Moche, La Libertad (a las afueras de Trujillo).",
    latitude: "-7.985000",
    longitude: "-78.832000",
    checkinTime: "15:00",
    checkoutTime: "12:00",
    fullCheckinTime: "09:00",
    fullCheckoutTime: "18:00",
    baseCapacity: 12,
    maxCapacity: 16,
    // Extra-person fee removed — the 16-person tier price covers the larger group
    // and unlocks the Cabaña; there is no separate per-person surcharge.
    extraPersonCents: 0,
    // Casa Grande sells as a 2 días / 1 noche full package → minimum is 1 night.
    minNightsDefault: 1,
    petPolicy: "pet_friendly",
    petPolicyNote: "Bienvenidas las mascotas — mantén supervisión cerca del río.",
    eventsEnabled: true,
    active: true,
    order: 0,
    createdAt: now,
    updatedAt: now,
  },
];

// ============================================================
// Rooms
// ============================================================

export const ROOMS: Room[] = [
  // Chalet — 3 habitaciones, 1 piso
  {
    id: "aaaaaaa1-0000-0000-0000-000000000001",
    propertyId: CHALET_ID,
    floor: "Planta principal",
    name: "Dormitorio principal",
    description: "Cama king-size, vista al valle, baño en suite.",
    beds: [{ size: "King", count: 1 }] satisfies Bed[],
    hasBathroom: true,
    order: 0,
    createdAt: now,
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000002",
    propertyId: CHALET_ID,
    floor: "Planta principal",
    name: "Dormitorio doble",
    description: "Dos camas de 2 plazas, ideal para amigos o familia.",
    beds: [{ size: "2 plazas", count: 2 }] satisfies Bed[],
    hasBathroom: false,
    order: 1,
    createdAt: now,
  },
  {
    id: "aaaaaaa1-0000-0000-0000-000000000003",
    propertyId: CHALET_ID,
    floor: "Planta principal",
    name: "Loft adicional",
    description: "Cama de plaza y media en altillo, perfecto para un huésped extra.",
    beds: [{ size: "1.5 plazas", count: 1 }] satisfies Bed[],
    hasBathroom: false,
    order: 2,
    createdAt: now,
  },

  // Casa Grande — 5 habitaciones (4 en la casa principal + Cabaña exclusiva 12+)
  {
    id: "bbbbbbb2-0000-0000-0000-000000000001",
    propertyId: CASA_GRANDE_ID,
    floor: "1er piso",
    name: "Suite principal",
    description: "King-size, baño en suite, terraza con vista al río.",
    beds: [{ size: "King", count: 1 }] satisfies Bed[],
    hasBathroom: true,
    order: 0,
    createdAt: now,
  },
  {
    id: "bbbbbbb2-0000-0000-0000-000000000002",
    propertyId: CASA_GRANDE_ID,
    floor: "1er piso",
    name: "Habitación familiar",
    description: "Dos camas de 2 plazas + una cuna disponible bajo solicitud.",
    beds: [{ size: "2 plazas", count: 2 }] satisfies Bed[],
    hasBathroom: true,
    order: 1,
    createdAt: now,
  },
  {
    id: "bbbbbbb2-0000-0000-0000-000000000003",
    propertyId: CASA_GRANDE_ID,
    floor: "2do piso",
    name: "Dormitorio doble A",
    description: "Dos camas individuales, ventana al jardín.",
    beds: [{ size: "1 plaza", count: 2 }] satisfies Bed[],
    hasBathroom: false,
    order: 2,
    createdAt: now,
  },
  {
    id: "bbbbbbb2-0000-0000-0000-000000000004",
    propertyId: CASA_GRANDE_ID,
    floor: "2do piso",
    name: "Dormitorio doble B",
    description: "Una cama queen + un sofá-cama de 1 plaza.",
    beds: [
      { size: "Queen", count: 1 },
      { size: "1 plaza (sofá-cama)", count: 1 },
    ] satisfies Bed[],
    hasBathroom: false,
    order: 3,
    createdAt: now,
  },
  {
    id: "bbbbbbb2-0000-0000-0000-000000000005",
    propertyId: CASA_GRANDE_ID,
    floor: "Casa Principal · Cabaña",
    name: "Cabaña",
    description:
      "Cabaña independiente con cuatro camas individuales. Se habilita exclusivamente para grupos de más de 12 personas (tarifa 16).",
    beds: [{ size: "1 plaza", count: 4 }] satisfies Bed[],
    hasBathroom: true,
    order: 4,
    createdAt: now,
  },
];

// ============================================================
// Amenities
// ============================================================

const amenity = (
  id: string,
  propertyId: string,
  name: string,
  category: string,
  icon: string,
  order: number,
): Amenity => ({ id, propertyId, name, category, icon, order, active: true });

export const AMENITIES: Amenity[] = [
  // Chalet
  amenity("amen-c-01", CHALET_ID, "Cocina equipada", "interior", "ChefHat", 0),
  amenity("amen-c-02", CHALET_ID, "WiFi de alta velocidad", "interior", "Wifi", 1),
  amenity("amen-c-03", CHALET_ID, "Chimenea a leña", "interior", "Flame", 2),
  amenity("amen-c-04", CHALET_ID, "TV con streaming", "interior", "Tv", 3),
  amenity("amen-c-05", CHALET_ID, "Terraza con vista", "exterior", "TreePine", 4),
  amenity("amen-c-06", CHALET_ID, "Parrilla a leña", "exterior", "Flame", 5),
  amenity("amen-c-07", CHALET_ID, "Estacionamiento privado", "exterior", "Car", 6),
  amenity("amen-c-08", CHALET_ID, "Toallas y blancos premium", "extras", "BedDouble", 7),

  // Casa Grande
  amenity("amen-q-01", CASA_GRANDE_ID, "Piscina temperada", "exterior", "Waves", 0),
  amenity("amen-q-02", CASA_GRANDE_ID, "Acceso directo al río", "exterior", "Waves", 1),
  amenity("amen-q-03", CASA_GRANDE_ID, "Parrilla y zona de fogata", "exterior", "Flame", 2),
  amenity("amen-q-04", CASA_GRANDE_ID, "Jardín amplio", "exterior", "TreePine", 3),
  amenity("amen-q-05", CASA_GRANDE_ID, "Cocina industrial", "interior", "ChefHat", 4),
  amenity("amen-q-06", CASA_GRANDE_ID, "WiFi en toda la casa", "interior", "Wifi", 5),
  amenity("amen-q-07", CASA_GRANDE_ID, "Sala de juegos", "interior", "Gamepad2", 6),
  amenity("amen-q-08", CASA_GRANDE_ID, "Aire acondicionado", "interior", "Snowflake", 7),
  amenity("amen-q-09", CASA_GRANDE_ID, "Estacionamiento amplio", "extras", "Car", 8),
  amenity("amen-q-10", CASA_GRANDE_ID, "Pet-friendly", "extras", "PawPrint", 9),
  amenity("amen-q-11", CASA_GRANDE_ID, "Cabaña (exclusiva grupos 12+)", "extras", "Home", 10),
];

// ============================================================
// Rules
// ============================================================

const rule = (
  id: string,
  propertyId: string,
  category: string,
  body: string,
  order: number,
): Rule => ({ id, propertyId, category, body, order, active: true });

export const RULES: Rule[] = [
  // Chalet
  rule("rule-c-01", CHALET_ID, "Convivencia", "Horario de silencio desde las 22:00 hrs.", 0),
  rule("rule-c-02", CHALET_ID, "Convivencia", "No se permiten eventos ni fiestas en la propiedad.", 1),
  rule("rule-c-03", CHALET_ID, "Convivencia", "Prohibido fumar en interiores.", 2),
  rule("rule-c-04", CHALET_ID, "Mascotas", "Solo con acuerdo previo con el anfitrión.", 3),
  rule("rule-c-05", CHALET_ID, "Mascotas", "Mantén a tu mascota con supervisión en exteriores.", 4),
  rule("rule-c-06", CHALET_ID, "Check-in/out", "Check-in desde las 15:00. Check-out hasta las 12:00.", 5),
  rule("rule-c-07", CHALET_ID, "Check-in/out", "Late check-out sujeto a disponibilidad.", 6),
  rule("rule-c-08", CHALET_ID, "Check-in/out", "Devolución del depósito de garantía dentro de las 48 horas tras el check-out.", 7),

  // Casa Grande
  rule("rule-q-01", CASA_GRANDE_ID, "Convivencia", "Horario de silencio desde las 23:00 hrs (excepto eventos confirmados).", 0),
  rule("rule-q-02", CASA_GRANDE_ID, "Convivencia", "Capacidad máxima 16 personas — no se admiten visitas adicionales sin aviso.", 1),
  rule("rule-q-03", CASA_GRANDE_ID, "Convivencia", "Prohibido fumar dentro de la casa.", 2),
  rule("rule-q-04", CASA_GRANDE_ID, "Convivencia", "Música a volumen moderado dentro del horario permitido.", 3),
  rule("rule-q-05", CASA_GRANDE_ID, "Mascotas", "Bienvenidas — supervisa cerca del río.", 4),
  rule("rule-q-06", CASA_GRANDE_ID, "Mascotas", "Limpieza extra en caso de pelo o daños menores.", 5),
  rule("rule-q-07", CASA_GRANDE_ID, "Check-in/out", "Tarifa por noche (2+ noches): check-in 15:00, check-out 12:00.", 6),
  rule("rule-q-08", CASA_GRANDE_ID, "Check-in/out", "Horario full (1 noche): check-in 09:00 / check-out 18:00 del día siguiente.", 7),
  rule("rule-q-09", CASA_GRANDE_ID, "Check-in/out", "La tarifa 16 (grupos de más de 12) habilita la Cabaña exclusiva; la tarifa 12 usa la casa principal.", 8),
  rule("rule-q-10", CASA_GRANDE_ID, "Check-in/out", "Depósito de garantía S/ 300 reembolsable tras inspección.", 9),
];

// ============================================================
// Pricing modalities
// ============================================================
// dayMask: 0=Sun..6=Sat
//   Mon-Thu = 30, Fri-Sat-Sun = 97, Mon-Fri = 62, Sat-Sun = 65

export const PRICING_MODALITIES: PricingModality[] = [
  // Chalet
  {
    id: "pm-c-01",
    propertyId: CHALET_ID,
    name: "1 noche Lun-Jue",
    kind: "per_night",
    dayMask: 30,
    capacityTier: null,
    priceCents: 65000,
    minNights: 1,
    packageNights: null,
    priority: 10,
    active: true,
    createdAt: now,
  },
  {
    id: "pm-c-02",
    propertyId: CHALET_ID,
    name: "1 noche Vie-Sáb-Dom",
    kind: "per_night",
    dayMask: 97,
    capacityTier: null,
    priceCents: 80000,
    minNights: 1,
    packageNights: null,
    priority: 10,
    active: true,
    createdAt: now,
  },
  {
    id: "pm-c-03",
    propertyId: CHALET_ID,
    name: "Full 2 días 1 noche Lun-Vie",
    kind: "full_package",
    dayMask: 62,
    capacityTier: null,
    priceCents: 105000,
    minNights: 1,
    packageNights: 1,
    priority: 20,
    active: true,
    createdAt: now,
  },
  {
    id: "pm-c-04",
    propertyId: CHALET_ID,
    name: "Full 2 días 1 noche Sáb-Dom",
    kind: "full_package",
    dayMask: 65,
    capacityTier: null,
    priceCents: 140000,
    minNights: 1,
    packageNights: 1,
    priority: 20,
    active: true,
    createdAt: now,
  },

  // Casa Grande — two modalities the guest never has to pick manually; the
  // night count decides which one applies (see resolveStay):
  //   · 1 noche  → "Horario full" package (9am → 6pm del día siguiente)
  //   · 2+ noches → "Por noche" rate (ingreso 3pm, salida 12pm), mínimo 2
  // Both run every day of the week (dayMask = 127). The 16-person tier unlocks
  // the Cabaña; the 12-person tier uses the casa principal only.
  {
    id: "pm-q-01",
    propertyId: CASA_GRANDE_ID,
    name: "Por noche — 12 personas",
    kind: "per_night",
    dayMask: 127,
    capacityTier: 12,
    priceCents: 140000,
    minNights: 2,
    packageNights: null,
    priority: 10,
    active: true,
    createdAt: now,
  },
  {
    id: "pm-q-02",
    propertyId: CASA_GRANDE_ID,
    name: "Por noche — 16 personas",
    kind: "per_night",
    dayMask: 127,
    capacityTier: 16,
    priceCents: 165000,
    minNights: 2,
    packageNights: null,
    priority: 20,
    active: true,
    createdAt: now,
  },
  {
    id: "pm-q-03",
    propertyId: CASA_GRANDE_ID,
    name: "Horario full — 12 personas",
    kind: "full_package",
    dayMask: 127,
    capacityTier: 12,
    priceCents: 225000,
    minNights: 1,
    packageNights: 1,
    priority: 10,
    active: true,
    createdAt: now,
  },
  {
    id: "pm-q-04",
    propertyId: CASA_GRANDE_ID,
    name: "Horario full — 16 personas",
    kind: "full_package",
    dayMask: 127,
    capacityTier: 16,
    priceCents: 255000,
    minNights: 1,
    packageNights: 1,
    priority: 20,
    active: true,
    createdAt: now,
  },
];

// ============================================================
// Seasonal overrides (empty per project decision — owner adds via /admin)
// ============================================================

export const SEASONAL_OVERRIDES: SeasonalOverride[] = [];

// ============================================================
// Event packages (Casa Grande only)
// ============================================================

export const EVENT_PACKAGES: EventPackage[] = [
  {
    id: "ep-q-01",
    propertyId: CASA_GRANDE_ID,
    name: "Hasta 20 personas",
    maxGuests: 20,
    priceCents: 320000,
    includesLodgingCapacity: 12,
    vendorDaysBefore: 1,
    dismountDaysAfter: 1,
    guestStartTime: "10:00",
    guestEndTime: "19:00",
    parkingPropertyId: null,
    parkingCarsCapacity: null,
    notes: "Reunión íntima — la casa permanece reservada solo para tu grupo.",
    order: 10,
    active: true,
  },
  {
    id: "ep-q-02",
    propertyId: CASA_GRANDE_ID,
    name: "Hasta 50 personas",
    maxGuests: 50,
    priceCents: 450000,
    includesLodgingCapacity: 12,
    vendorDaysBefore: 1,
    dismountDaysAfter: 1,
    guestStartTime: "10:00",
    guestEndTime: "19:00",
    parkingPropertyId: null,
    parkingCarsCapacity: null,
    notes: "Celebración mediana con catering y zona de baile.",
    order: 20,
    active: true,
  },
  {
    id: "ep-q-03",
    propertyId: CASA_GRANDE_ID,
    name: "Hasta 100 personas",
    maxGuests: 100,
    priceCents: 560000,
    includesLodgingCapacity: 16,
    vendorDaysBefore: 2,
    dismountDaysAfter: 2,
    guestStartTime: "10:00",
    guestEndTime: "19:00",
    parkingPropertyId: CHALET_ID,
    parkingCarsCapacity: 40,
    notes: "Incluye estacionamiento de hasta 40 vehículos en el Chalet.",
    order: 30,
    active: true,
  },
  {
    id: "ep-q-04",
    propertyId: CASA_GRANDE_ID,
    name: "Hasta 150 personas",
    maxGuests: 150,
    priceCents: 650000,
    includesLodgingCapacity: 16,
    vendorDaysBefore: 2,
    dismountDaysAfter: 2,
    guestStartTime: "10:00",
    guestEndTime: "19:00",
    parkingPropertyId: CHALET_ID,
    parkingCarsCapacity: 40,
    notes: "Eventos de gran escala: bodas, corporativos, celebraciones familiares.",
    order: 40,
    active: true,
  },
];

// ============================================================
// Media (placeholders — no real files until client delivery)
// ============================================================

export const MEDIA: Media[] = [];

// ============================================================
// Blocked dates (empty at launch)
// ============================================================

export const BLOCKED_DATES: BlockedDate[] = [];

// ============================================================
// Content (key-value, optionally scoped to a property)
// ============================================================

const contentRow = (
  id: string,
  propertyId: string | null,
  key: string,
  value: string,
): Content => ({ id, propertyId, key, value, updatedAt: now });

export const CONTENT: Content[] = [
  // Brand-level "Lo que nos une"
  contentRow("c-brand-01", null, "brand.value.1.title", "Un refugio solo tuyo"),
  contentRow(
    "c-brand-02",
    null,
    "brand.value.1.body",
    "La propiedad entera, reservada para tu grupo. Naturaleza, silencio y aire limpio a 40 minutos de Trujillo.",
  ),
  contentRow("c-brand-03", null, "brand.value.2.title", "Cuidado en cada detalle"),
  contentRow(
    "c-brand-04",
    null,
    "brand.value.2.body",
    "Espacios pensados al detalle para el descanso, la conversación y los amaneceres sin prisa.",
  ),
  contentRow("c-brand-05", null, "brand.value.3.title", "Atención cercana"),
  contentRow(
    "c-brand-06",
    null,
    "brand.value.3.body",
    "Un equipo que conoce cada rincón del valle y responde por WhatsApp en minutos.",
  ),

  // Chalet FAQs
  contentRow("c-ch-faq-q1", CHALET_ID, "faq.q.1", "¿Está incluida la limpieza final?"),
  contentRow("c-ch-faq-a1", CHALET_ID, "faq.a.1", "Sí, la limpieza final está incluida en la tarifa."),
  contentRow("c-ch-faq-q2", CHALET_ID, "faq.q.2", "¿Hay cobertura celular en el Chalet?"),
  contentRow("c-ch-faq-a2", CHALET_ID, "faq.a.2", "Sí, además contamos con WiFi de alta velocidad."),
  contentRow("c-ch-faq-q3", CHALET_ID, "faq.q.3", "¿Cómo llego desde Trujillo?"),
  contentRow("c-ch-faq-a3", CHALET_ID, "faq.a.3", "Aproximadamente 40 minutos en auto por la carretera a Simbal. Te enviamos un pin de Google Maps al confirmar."),
  contentRow("c-ch-faq-q4", CHALET_ID, "faq.q.4", "¿Aceptan mascotas?"),
  contentRow("c-ch-faq-a4", CHALET_ID, "faq.a.4", "Sí, con acuerdo previo. Coordinemos por WhatsApp antes de reservar."),
  contentRow("c-ch-faq-q5", CHALET_ID, "faq.q.5", "¿Cómo se confirma la reserva?"),
  contentRow("c-ch-faq-a5", CHALET_ID, "faq.a.5", "Tras tu solicitud, te enviamos cuenta bancaria y Yape. Con el 50% se confirma la reserva."),

  // Casa Grande FAQs
  contentRow("c-q-faq-q1", CASA_GRANDE_ID, "faq.q.1", "¿La piscina está disponible todo el año?"),
  contentRow("c-q-faq-a1", CASA_GRANDE_ID, "faq.a.1", "Sí, la piscina está temperada y disponible todo el año."),
  contentRow("c-q-faq-q2", CASA_GRANDE_ID, "faq.q.2", "¿Puedo hacer un evento en Casa Principal?"),
  contentRow("c-q-faq-a2", CASA_GRANDE_ID, "faq.a.2", "Sí, contamos con paquetes desde 20 hasta 150 personas. Revisa la sección Eventos."),
  contentRow("c-q-faq-q3", CASA_GRANDE_ID, "faq.q.3", "¿Cuál es la diferencia entre tarifa 12 y 16 personas?"),
  contentRow("c-q-faq-a3", CASA_GRANDE_ID, "faq.a.3", "La tarifa 12 usa la casa principal (4 habitaciones). La tarifa 16, para grupos de más de 12, habilita además la Cabaña — un espacio exclusivo con 4 camas adicionales."),
  contentRow("c-q-faq-q4", CASA_GRANDE_ID, "faq.q.4", "¿Puedo llegar con mi mascota?"),
  contentRow("c-q-faq-a4", CASA_GRANDE_ID, "faq.a.4", "Sí, Casa Principal es pet-friendly. Supervisa cerca del río y el jardín."),
  contentRow("c-q-faq-q5", CASA_GRANDE_ID, "faq.q.5", "¿Qué incluye la modalidad full 2 días 1 noche?"),
  contentRow("c-q-faq-a5", CASA_GRANDE_ID, "faq.a.5", "Check-in 09:00 del primer día y check-out 18:00 del día siguiente: 33 horas de uso continuo."),

  // Eventos page (Casa Grande)
  contentRow("c-q-evt-vp1-t", CASA_GRANDE_ID, "events.value.1.title", "Hasta 150 invitados"),
  contentRow("c-q-evt-vp1-b", CASA_GRANDE_ID, "events.value.1.body", "Capacidad cómoda para bodas, corporativos y celebraciones."),
  contentRow("c-q-evt-vp2-t", CASA_GRANDE_ID, "events.value.2.title", "Acceso al río"),
  contentRow("c-q-evt-vp2-b", CASA_GRANDE_ID, "events.value.2.body", "Marco natural único — fotos en el río Moche al atardecer."),
  contentRow("c-q-evt-vp3-t", CASA_GRANDE_ID, "events.value.3.title", "Estacionamiento Chalet"),
  contentRow("c-q-evt-vp3-b", CASA_GRANDE_ID, "events.value.3.body", "Paquetes 100/150 incluyen hasta 40 autos en el Chalet contiguo."),
  contentRow("c-q-evt-vp4-t", CASA_GRANDE_ID, "events.value.4.title", "Parrilla y fogata"),
  contentRow("c-q-evt-vp4-b", CASA_GRANDE_ID, "events.value.4.body", "Zonas al aire libre para after-party y momentos íntimos."),

  // Incluye / no incluye
  contentRow("c-q-inc-1", CASA_GRANDE_ID, "events.included.1", "Uso exclusivo de la casa y jardín durante el evento"),
  contentRow("c-q-inc-2", CASA_GRANDE_ID, "events.included.2", "Mobiliario base: mesas y sillas para el aforo del paquete"),
  contentRow("c-q-inc-3", CASA_GRANDE_ID, "events.included.3", "Hospedaje incluido para 12 ó 16 personas (según paquete)"),
  contentRow("c-q-inc-4", CASA_GRANDE_ID, "events.included.4", "Día previo de montaje y día siguiente de desmontaje"),
  contentRow("c-q-inc-5", CASA_GRANDE_ID, "events.included.5", "Coordinador on-site el día del evento"),
  contentRow("c-q-exc-1", CASA_GRANDE_ID, "events.excluded.1", "Catering, bebidas y servicio de meseros"),
  contentRow("c-q-exc-2", CASA_GRANDE_ID, "events.excluded.2", "Decoración, flores y mantelería personalizada"),
  contentRow("c-q-exc-3", CASA_GRANDE_ID, "events.excluded.3", "DJ, banda en vivo o equipos de sonido extendidos"),
  contentRow("c-q-exc-4", CASA_GRANDE_ID, "events.excluded.4", "Permisos APDAYC y tasa municipal por basura"),
  contentRow("c-q-exc-5", CASA_GRANDE_ID, "events.excluded.5", "Seguridad o personal adicional fuera del coordinador"),
];

// ============================================================
// Settings (single brand-level row)
// ============================================================

export const SETTINGS: Settings = {
  id: "settings-singleton",
  adminEmail: "admin@casacampo.pe",
  whatsapp: "+51902021725",
  whatsappEvents: "+51902021725",
  contactEmail: "reservas@casacampo.pe",
  attentionHours: "9:00 - 21:00",
  instagram: "casacampoquirihuac",
  tiktok: "casacampo.quirihuac",
  facebook: null,
  paymentMethods: [
    {
      kind: "transfer",
      bank: "PENDIENTE",
      accountNumber: "PENDIENTE",
      cci: "PENDIENTE",
      holder: "PENDIENTE",
    },
    {
      kind: "yape",
      phone: "+51902021725",
      holder: "PENDIENTE",
    },
  ],
  cancellationPolicy:
    "Para confirmar la reserva se solicita un primer pago equivalente al 50% del total. El 50% restante se cancela hasta 2 días antes del check-in. La inasistencia o cancelación con menos de 48 horas de anticipación no es reembolsable.",
  eventAddonsNote:
    "APDAYC y tasa municipal por basura (aprox. S/ 120) se cobran aparte y se gestionan directamente con la municipalidad.",
  updatedAt: now,
};

// ============================================================
// Reservations (sample data — replace with DB rows in prod)
// ============================================================

export const RESERVATIONS: Reservation[] = [];

// ============================================================
// Event quotes (sample data)
// ============================================================

export const EVENT_QUOTES: EventQuote[] = [];

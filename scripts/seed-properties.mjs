// Seeds the minimum rows needed for admin features (calendar manual blocks,
// reservation FKs) to operate against the live DB. Uses the same UUIDs as
// src/db/seed.ts so mock data and live data stay consistent.
//
// Idempotent: every insert uses ON CONFLICT (id) DO NOTHING.
//
// Run: pnpm db:seed

import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

const CHALET_ID = "11111111-1111-1111-1111-111111111111";
const CASA_GRANDE_ID = "22222222-2222-2222-2222-222222222222";

const PROPERTIES = [
  {
    id: CHALET_ID,
    slug: "chalet",
    name: "Chalet",
    short_name: "Chalet",
    tagline: "Tu refugio privado en el valle",
    description_short:
      "Un chalet íntimo en el corazón del valle, reservado solo para los tuyos.",
    description_long:
      "Un refugio íntimo para desconectar sin prisa. Naturaleza, vistas a las montañas y un espacio reservado solo para tu grupo.",
    address_line:
      "Km 23.5 Carretera a Simbal (antes del peaje). Sector Santa Rosa / Quirihuac",
    latitude: "-7.972500",
    longitude: "-78.860800",
    checkin_time: "15:00",
    checkout_time: "12:00",
    full_checkin_time: "09:00",
    full_checkout_time: "18:00",
    base_capacity: 5,
    max_capacity: 5,
    extra_person_cents: 0,
    min_nights_default: 1,
    pet_policy: "by_request",
    pet_policy_note: "Mascotas solo con acuerdo previo con el anfitrión.",
    events_enabled: false,
    active: true,
    order: 1,
  },
  {
    id: CASA_GRANDE_ID,
    slug: "casa-grande",
    name: "Casa Principal",
    short_name: "Casa Principal",
    tagline: "Donde la calma se vuelve hogar",
    description_short:
      "Casa de campo con acceso privado al río Moche, pensada al detalle.",
    description_long:
      "Casa de campo con acceso privado al río, piscina y diseño cálido de cabaña. El espacio entero, reservado para tu familia o celebración.",
    address_line:
      "Quirihuac, valle del río Moche, La Libertad (a las afueras de Trujillo).",
    latitude: "-7.985000",
    longitude: "-78.832000",
    checkin_time: "15:00",
    checkout_time: "12:00",
    full_checkin_time: "09:00",
    full_checkout_time: "18:00",
    base_capacity: 12,
    max_capacity: 16,
    extra_person_cents: 0,
    min_nights_default: 1,
    pet_policy: "pet_friendly",
    pet_policy_note:
      "Bienvenidas las mascotas — mantén supervisión cerca del río.",
    events_enabled: true,
    active: true,
    order: 0,
  },
];

const SETTINGS = {
  id: "00000000-0000-0000-0000-000000000001",
  admin_email: "admin@casacampo.pe",
  whatsapp: "+51902021725",
  whatsapp_events: "+51902021725",
  contact_email: "reservas@casacampo.pe",
  attention_hours: "9:00 - 21:00",
  instagram: "casacampoquirihuac",
  tiktok: "casacampo.quirihuac",
  facebook: null,
  payment_methods: JSON.stringify([
    {
      kind: "transfer",
      bank: "PENDIENTE",
      accountNumber: "PENDIENTE",
      cci: "PENDIENTE",
      holder: "PENDIENTE",
    },
    { kind: "yape", phone: "+51902021725", holder: "PENDIENTE" },
  ]),
  cancellation_policy:
    "Para confirmar la reserva se solicita un primer pago equivalente al 50% del total. El 50% restante se cancela hasta 2 días antes del check-in. La inasistencia o cancelación con menos de 48 horas de anticipación no es reembolsable.",
  event_addons_note:
    "APDAYC y tasa municipal por basura (aprox. S/ 120) se cobran aparte y se gestionan directamente con la municipalidad.",
};

// Pricing modalities (per-property). UUIDs deterministic — pmXXXXXXXX-...
const PRICING_MODALITIES = [
  // Chalet
  ["31111111-0000-0000-0000-000000000001", CHALET_ID, "1 noche Lun-Jue", "per_night", 30, null, 65000, 1, null, 10],
  ["31111111-0000-0000-0000-000000000002", CHALET_ID, "1 noche Vie-Sáb-Dom", "per_night", 97, null, 80000, 1, null, 10],
  ["31111111-0000-0000-0000-000000000003", CHALET_ID, "Full 2 días 1 noche Lun-Vie", "full_package", 62, null, 105000, 1, 1, 20],
  ["31111111-0000-0000-0000-000000000004", CHALET_ID, "Full 2 días 1 noche Sáb-Dom", "full_package", 65, null, 140000, 1, 1, 20],
  // Casa Grande — night count decides the rate (see resolveStay):
  //   1 noche -> "Horario full" package; 2+ noches -> "Por noche" rate (min 2).
  //   Both run every day (dayMask 127). 16-tier unlocks the Cabaña.
  ["32222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "Por noche — 12 personas", "per_night", 127, 12, 140000, 2, null, 10],
  ["32222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "Por noche — 16 personas", "per_night", 127, 16, 165000, 2, null, 20],
  ["32222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "Horario full — 12 personas", "full_package", 127, 12, 225000, 1, 1, 10],
  ["32222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "Horario full — 16 personas", "full_package", 127, 16, 255000, 1, 1, 20],
];

// Event packages (Casa Grande only)
const EVENT_PACKAGES = [
  ["41111111-0000-0000-0000-000000000001", CASA_GRANDE_ID, "Hasta 20 personas", 20, 320000, 12, 1, 1, "10:00", "19:00", null, null, "Reunión íntima — la casa permanece reservada solo para tu grupo.", 10],
  ["41111111-0000-0000-0000-000000000002", CASA_GRANDE_ID, "Hasta 50 personas", 50, 450000, 12, 1, 1, "10:00", "19:00", null, null, "Celebración mediana con catering y zona de baile.", 20],
  ["41111111-0000-0000-0000-000000000003", CASA_GRANDE_ID, "Hasta 100 personas", 100, 560000, 16, 2, 2, "10:00", "19:00", CHALET_ID, 40, "Incluye estacionamiento de hasta 40 vehículos en el Chalet.", 30],
  ["41111111-0000-0000-0000-000000000004", CASA_GRANDE_ID, "Hasta 150 personas", 150, 650000, 16, 2, 2, "10:00", "19:00", CHALET_ID, 40, "Eventos de gran escala: bodas, corporativos, celebraciones familiares.", 40],
];

// Rooms
const ROOMS = [
  ["a1111111-0000-0000-0000-000000000001", CHALET_ID, "Planta principal", "Dormitorio principal", "Cama king-size, vista al valle, baño en suite.", [{ size: "King", count: 1 }], true, 0],
  ["a1111111-0000-0000-0000-000000000002", CHALET_ID, "Planta principal", "Dormitorio doble", "Dos camas de 2 plazas, ideal para amigos o familia.", [{ size: "2 plazas", count: 2 }], false, 1],
  ["a1111111-0000-0000-0000-000000000003", CHALET_ID, "Planta principal", "Loft adicional", "Cama de plaza y media en altillo, perfecto para un huésped extra.", [{ size: "1.5 plazas", count: 1 }], false, 2],
  ["b2222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "1er piso", "Suite principal", "King-size, baño en suite, terraza con vista al río.", [{ size: "King", count: 1 }], true, 0],
  ["b2222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "1er piso", "Habitación familiar", "Dos camas de 2 plazas + una cuna disponible bajo solicitud.", [{ size: "2 plazas", count: 2 }], true, 1],
  ["b2222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "2do piso", "Dormitorio doble A", "Dos camas individuales, ventana al jardín.", [{ size: "1 plaza", count: 2 }], false, 2],
  ["b2222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "2do piso", "Dormitorio doble B", "Una cama queen + un sofá-cama de 1 plaza.", [{ size: "Queen", count: 1 }, { size: "1 plaza (sofá-cama)", count: 1 }], false, 3],
  ["b2222222-0000-0000-0000-000000000005", CASA_GRANDE_ID, "Casa Principal · Cabaña", "Cabaña", "Cabaña independiente con cuatro camas individuales. Se habilita exclusivamente para grupos de más de 12 personas (tarifa 16).", [{ size: "1 plaza", count: 4 }], true, 4],
];

// Amenities — deterministic UUIDs derived from amen-c-NN / amen-q-NN slugs
const AMENITIES = [
  ["c1111111-0000-0000-0000-000000000001", CHALET_ID, "Cocina equipada", "interior", "ChefHat", 0],
  ["c1111111-0000-0000-0000-000000000002", CHALET_ID, "WiFi de alta velocidad", "interior", "Wifi", 1],
  ["c1111111-0000-0000-0000-000000000003", CHALET_ID, "Chimenea a leña", "interior", "Flame", 2],
  ["c1111111-0000-0000-0000-000000000004", CHALET_ID, "TV con streaming", "interior", "Tv", 3],
  ["c1111111-0000-0000-0000-000000000005", CHALET_ID, "Terraza con vista", "exterior", "TreePine", 4],
  ["c1111111-0000-0000-0000-000000000006", CHALET_ID, "Parrilla a leña", "exterior", "Flame", 5],
  ["c1111111-0000-0000-0000-000000000007", CHALET_ID, "Estacionamiento privado", "exterior", "Car", 6],
  ["c1111111-0000-0000-0000-000000000008", CHALET_ID, "Toallas y blancos premium", "extras", "BedDouble", 7],
  ["c2222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "Piscina temperada", "exterior", "Waves", 0],
  ["c2222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "Acceso directo al río", "exterior", "Waves", 1],
  ["c2222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "Parrilla y zona de fogata", "exterior", "Flame", 2],
  ["c2222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "Jardín amplio", "exterior", "TreePine", 3],
  ["c2222222-0000-0000-0000-000000000005", CASA_GRANDE_ID, "Cocina industrial", "interior", "ChefHat", 4],
  ["c2222222-0000-0000-0000-000000000006", CASA_GRANDE_ID, "WiFi en toda la casa", "interior", "Wifi", 5],
  ["c2222222-0000-0000-0000-000000000007", CASA_GRANDE_ID, "Sala de juegos", "interior", "Gamepad2", 6],
  ["c2222222-0000-0000-0000-000000000008", CASA_GRANDE_ID, "Aire acondicionado", "interior", "Snowflake", 7],
  ["c2222222-0000-0000-0000-000000000009", CASA_GRANDE_ID, "Estacionamiento amplio", "extras", "Car", 8],
  ["c2222222-0000-0000-0000-000000000010", CASA_GRANDE_ID, "Pet-friendly", "extras", "PawPrint", 9],
  ["c2222222-0000-0000-0000-000000000011", CASA_GRANDE_ID, "Cabaña (exclusiva grupos 12+)", "extras", "Home", 10],
];

// Rules
const RULES = [
  ["d1111111-0000-0000-0000-000000000001", CHALET_ID, "Convivencia", "Horario de silencio desde las 22:00 hrs.", 0],
  ["d1111111-0000-0000-0000-000000000002", CHALET_ID, "Convivencia", "No se permiten eventos ni fiestas en la propiedad.", 1],
  ["d1111111-0000-0000-0000-000000000003", CHALET_ID, "Convivencia", "Prohibido fumar en interiores.", 2],
  ["d1111111-0000-0000-0000-000000000004", CHALET_ID, "Mascotas", "Solo con acuerdo previo con el anfitrión.", 3],
  ["d1111111-0000-0000-0000-000000000005", CHALET_ID, "Mascotas", "Mantén a tu mascota con supervisión en exteriores.", 4],
  ["d1111111-0000-0000-0000-000000000006", CHALET_ID, "Check-in/out", "Check-in desde las 15:00. Check-out hasta las 12:00.", 5],
  ["d1111111-0000-0000-0000-000000000007", CHALET_ID, "Check-in/out", "Late check-out sujeto a disponibilidad.", 6],
  ["d1111111-0000-0000-0000-000000000008", CHALET_ID, "Check-in/out", "Devolución del depósito de garantía dentro de las 48 horas tras el check-out.", 7],
  ["d2222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "Convivencia", "Horario de silencio desde las 23:00 hrs (excepto eventos confirmados).", 0],
  ["d2222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "Convivencia", "Capacidad máxima 16 personas — no se admiten visitas adicionales sin aviso.", 1],
  ["d2222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "Convivencia", "Prohibido fumar dentro de la casa.", 2],
  ["d2222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "Convivencia", "Música a volumen moderado dentro del horario permitido.", 3],
  ["d2222222-0000-0000-0000-000000000005", CASA_GRANDE_ID, "Mascotas", "Bienvenidas — supervisa cerca del río.", 4],
  ["d2222222-0000-0000-0000-000000000006", CASA_GRANDE_ID, "Mascotas", "Limpieza extra en caso de pelo o daños menores.", 5],
  ["d2222222-0000-0000-0000-000000000007", CASA_GRANDE_ID, "Check-in/out", "Tarifa por noche (2+ noches): check-in 15:00, check-out 12:00.", 6],
  ["d2222222-0000-0000-0000-000000000008", CASA_GRANDE_ID, "Check-in/out", "Horario full (1 noche): check-in 09:00 / check-out 18:00 del día siguiente.", 7],
  ["d2222222-0000-0000-0000-000000000009", CASA_GRANDE_ID, "Check-in/out", "La tarifa 16 (grupos de más de 12) habilita la Cabaña exclusiva; la tarifa 12 usa la casa principal.", 8],
  ["d2222222-0000-0000-0000-000000000010", CASA_GRANDE_ID, "Check-in/out", "Depósito de garantía S/ 300 reembolsable tras inspección.", 9],
];

// Content (key-value). null property = brand-level.
const CONTENT = [
  // Brand-level
  ["e0000000-0000-0000-0000-000000000001", null, "brand.value.1.title", "Un refugio solo tuyo"],
  ["e0000000-0000-0000-0000-000000000002", null, "brand.value.1.body", "La propiedad entera, reservada para tu grupo. Naturaleza, silencio y aire limpio a 40 minutos de Trujillo."],
  ["e0000000-0000-0000-0000-000000000003", null, "brand.value.2.title", "Cuidado en cada detalle"],
  ["e0000000-0000-0000-0000-000000000004", null, "brand.value.2.body", "Espacios pensados al detalle para el descanso, la conversación y los amaneceres sin prisa."],
  ["e0000000-0000-0000-0000-000000000005", null, "brand.value.3.title", "Atención cercana"],
  ["e0000000-0000-0000-0000-000000000006", null, "brand.value.3.body", "Un equipo que conoce cada rincón del valle y responde por WhatsApp en minutos."],

  // Chalet FAQs
  ["e1111111-0000-0000-0000-000000000001", CHALET_ID, "faq.q.1", "¿Está incluida la limpieza final?"],
  ["e1111111-0000-0000-0000-000000000002", CHALET_ID, "faq.a.1", "Sí, la limpieza final está incluida en la tarifa."],
  ["e1111111-0000-0000-0000-000000000003", CHALET_ID, "faq.q.2", "¿Hay cobertura celular en el Chalet?"],
  ["e1111111-0000-0000-0000-000000000004", CHALET_ID, "faq.a.2", "Sí, además contamos con WiFi de alta velocidad."],
  ["e1111111-0000-0000-0000-000000000005", CHALET_ID, "faq.q.3", "¿Cómo llego desde Trujillo?"],
  ["e1111111-0000-0000-0000-000000000006", CHALET_ID, "faq.a.3", "Aproximadamente 40 minutos en auto por la carretera a Simbal. Te enviamos un pin de Google Maps al confirmar."],
  ["e1111111-0000-0000-0000-000000000007", CHALET_ID, "faq.q.4", "¿Aceptan mascotas?"],
  ["e1111111-0000-0000-0000-000000000008", CHALET_ID, "faq.a.4", "Sí, con acuerdo previo. Coordinemos por WhatsApp antes de reservar."],
  ["e1111111-0000-0000-0000-000000000009", CHALET_ID, "faq.q.5", "¿Cómo se confirma la reserva?"],
  ["e1111111-0000-0000-0000-000000000010", CHALET_ID, "faq.a.5", "Tras tu solicitud, te enviamos cuenta bancaria y Yape. Con el 50% se confirma la reserva."],

  // Casa Grande FAQs
  ["e2222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "faq.q.1", "¿La piscina está disponible todo el año?"],
  ["e2222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "faq.a.1", "Sí, la piscina está temperada y disponible todo el año."],
  ["e2222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "faq.q.2", "¿Puedo hacer un evento en Casa Principal?"],
  ["e2222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "faq.a.2", "Sí, contamos con paquetes desde 20 hasta 150 personas. Revisa la sección Eventos."],
  ["e2222222-0000-0000-0000-000000000005", CASA_GRANDE_ID, "faq.q.3", "¿Cuál es la diferencia entre tarifa 12 y 16 personas?"],
  ["e2222222-0000-0000-0000-000000000006", CASA_GRANDE_ID, "faq.a.3", "La tarifa 12 usa la casa principal (4 habitaciones). La tarifa 16, para grupos de más de 12, habilita además la Cabaña — un espacio exclusivo con 4 camas adicionales."],
  ["e2222222-0000-0000-0000-000000000007", CASA_GRANDE_ID, "faq.q.4", "¿Puedo llegar con mi mascota?"],
  ["e2222222-0000-0000-0000-000000000008", CASA_GRANDE_ID, "faq.a.4", "Sí, Casa Principal es pet-friendly. Supervisa cerca del río y el jardín."],
  ["e2222222-0000-0000-0000-000000000009", CASA_GRANDE_ID, "faq.q.5", "¿Qué incluye la modalidad full 2 días 1 noche?"],
  ["e2222222-0000-0000-0000-000000000010", CASA_GRANDE_ID, "faq.a.5", "Check-in 09:00 del primer día y check-out 18:00 del día siguiente: 33 horas de uso continuo."],

  // Eventos page (Casa Grande)
  ["e3222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "events.value.1.title", "Hasta 150 invitados"],
  ["e3222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "events.value.1.body", "Capacidad cómoda para bodas, corporativos y celebraciones."],
  ["e3222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "events.value.2.title", "Acceso al río"],
  ["e3222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "events.value.2.body", "Marco natural único — fotos en el río Moche al atardecer."],
  ["e3222222-0000-0000-0000-000000000005", CASA_GRANDE_ID, "events.value.3.title", "Estacionamiento Chalet"],
  ["e3222222-0000-0000-0000-000000000006", CASA_GRANDE_ID, "events.value.3.body", "Paquetes 100/150 incluyen hasta 40 autos en el Chalet contiguo."],
  ["e3222222-0000-0000-0000-000000000007", CASA_GRANDE_ID, "events.value.4.title", "Parrilla y fogata"],
  ["e3222222-0000-0000-0000-000000000008", CASA_GRANDE_ID, "events.value.4.body", "Zonas al aire libre para after-party y momentos íntimos."],

  ["e4222222-0000-0000-0000-000000000001", CASA_GRANDE_ID, "events.included.1", "Uso exclusivo de la casa y jardín durante el evento"],
  ["e4222222-0000-0000-0000-000000000002", CASA_GRANDE_ID, "events.included.2", "Mobiliario base: mesas y sillas para el aforo del paquete"],
  ["e4222222-0000-0000-0000-000000000003", CASA_GRANDE_ID, "events.included.3", "Hospedaje incluido para 12 ó 16 personas (según paquete)"],
  ["e4222222-0000-0000-0000-000000000004", CASA_GRANDE_ID, "events.included.4", "Día previo de montaje y día siguiente de desmontaje"],
  ["e4222222-0000-0000-0000-000000000005", CASA_GRANDE_ID, "events.included.5", "Coordinador on-site el día del evento"],
  ["e4222222-0000-0000-0000-000000000006", CASA_GRANDE_ID, "events.excluded.1", "Catering, bebidas y servicio de meseros"],
  ["e4222222-0000-0000-0000-000000000007", CASA_GRANDE_ID, "events.excluded.2", "Decoración, flores y mantelería personalizada"],
  ["e4222222-0000-0000-0000-000000000008", CASA_GRANDE_ID, "events.excluded.3", "DJ, banda en vivo o equipos de sonido extendidos"],
  ["e4222222-0000-0000-0000-000000000009", CASA_GRANDE_ID, "events.excluded.4", "Permisos APDAYC y tasa municipal por basura"],
  ["e4222222-0000-0000-0000-000000000010", CASA_GRANDE_ID, "events.excluded.5", "Seguridad o personal adicional fuera del coordinador"],
];

try {
  for (const p of PROPERTIES) {
    await sql`
      insert into properties (
        id, slug, name, short_name, tagline,
        description_short, description_long, address_line,
        latitude, longitude,
        checkin_time, checkout_time, full_checkin_time, full_checkout_time,
        base_capacity, max_capacity, extra_person_cents, min_nights_default,
        pet_policy, pet_policy_note, events_enabled, active, "order"
      ) values (
        ${p.id}, ${p.slug}, ${p.name}, ${p.short_name}, ${p.tagline},
        ${p.description_short}, ${p.description_long}, ${p.address_line},
        ${p.latitude}, ${p.longitude},
        ${p.checkin_time}, ${p.checkout_time}, ${p.full_checkin_time}, ${p.full_checkout_time},
        ${p.base_capacity}, ${p.max_capacity}, ${p.extra_person_cents}, ${p.min_nights_default},
        ${p.pet_policy}, ${p.pet_policy_note}, ${p.events_enabled}, ${p.active}, ${p.order}
      )
      on conflict (id) do update set
        tagline = excluded.tagline,
        description_short = excluded.description_short,
        description_long = excluded.description_long
    `;
    console.log(`  property ${p.slug} ensured`);
  }

  await sql`
    insert into settings (
      id, admin_email, whatsapp, whatsapp_events, contact_email, attention_hours,
      instagram, tiktok, facebook, payment_methods, cancellation_policy, event_addons_note
    ) values (
      ${SETTINGS.id}, ${SETTINGS.admin_email}, ${SETTINGS.whatsapp},
      ${SETTINGS.whatsapp_events}, ${SETTINGS.contact_email}, ${SETTINGS.attention_hours},
      ${SETTINGS.instagram}, ${SETTINGS.tiktok}, ${SETTINGS.facebook},
      ${SETTINGS.payment_methods}::jsonb, ${SETTINGS.cancellation_policy},
      ${SETTINGS.event_addons_note}
    )
    on conflict (id) do nothing
  `;
  console.log("  settings singleton ensured");

  for (const [id, propertyId, name, kind, dayMask, capacityTier, priceCents, minNights, packageNights, priority] of PRICING_MODALITIES) {
    await sql`
      insert into pricing_modalities (
        id, property_id, name, kind, day_mask, capacity_tier,
        price_cents, min_nights, package_nights, priority, active
      ) values (
        ${id}, ${propertyId}, ${name}, ${kind}, ${dayMask}, ${capacityTier},
        ${priceCents}, ${minNights}, ${packageNights}, ${priority}, true
      )
      on conflict (id) do nothing
    `;
  }
  console.log(`  ${PRICING_MODALITIES.length} pricing modalities ensured`);

  for (const [id, propertyId, name, maxGuests, priceCents, includesCap, vendorBefore, dismountAfter, startTime, endTime, parkingPropertyId, parkingCars, notes, order] of EVENT_PACKAGES) {
    await sql`
      insert into event_packages (
        id, property_id, name, max_guests, price_cents, includes_lodging_capacity,
        vendor_days_before, dismount_days_after, guest_start_time, guest_end_time,
        parking_property_id, parking_cars_capacity, notes, "order", active
      ) values (
        ${id}, ${propertyId}, ${name}, ${maxGuests}, ${priceCents}, ${includesCap},
        ${vendorBefore}, ${dismountAfter}, ${startTime}, ${endTime},
        ${parkingPropertyId}, ${parkingCars}, ${notes}, ${order}, true
      )
      on conflict (id) do nothing
    `;
  }
  console.log(`  ${EVENT_PACKAGES.length} event packages ensured`);

  for (const [id, propertyId, floor, name, description, beds, hasBathroom, order] of ROOMS) {
    await sql`
      insert into rooms (
        id, property_id, floor, name, description, beds, has_bathroom, "order"
      ) values (
        ${id}, ${propertyId}, ${floor}, ${name}, ${description},
        ${JSON.stringify(beds)}::jsonb, ${hasBathroom}, ${order}
      )
      on conflict (id) do nothing
    `;
  }
  console.log(`  ${ROOMS.length} rooms ensured`);

  for (const [id, propertyId, name, category, icon, order] of AMENITIES) {
    await sql`
      insert into amenities (
        id, property_id, name, category, icon, "order", active
      ) values (
        ${id}, ${propertyId}, ${name}, ${category}, ${icon}, ${order}, true
      )
      on conflict (id) do nothing
    `;
  }
  console.log(`  ${AMENITIES.length} amenities ensured`);

  for (const [id, propertyId, category, body, order] of RULES) {
    await sql`
      insert into rules (
        id, property_id, category, body, "order", active
      ) values (
        ${id}, ${propertyId}, ${category}, ${body}, ${order}, true
      )
      on conflict (id) do nothing
    `;
  }
  console.log(`  ${RULES.length} rules ensured`);

  for (const [id, propertyId, key, value] of CONTENT) {
    await sql`
      insert into content (id, property_id, key, value)
      values (${id}, ${propertyId}, ${key}, ${value})
      on conflict (id) do update set value = excluded.value
    `;
  }
  console.log(`  ${CONTENT.length} content rows ensured`);

  console.log("\nSeed complete.");
} catch (err) {
  console.error("Failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}

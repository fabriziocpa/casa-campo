export type Photo = { src: string; alt: string; aspect?: "landscape" | "portrait" };

// Marca / inicio / galería "Momentos"
export const BRAND_PHOTOS: Photo[] = [
  { src: "/fotos/casa_grande.avif", alt: "Casa Principal al atardecer", aspect: "landscape" },
  { src: "/fotos/cabana_frontal.avif", alt: "Frontal de la Cabaña", aspect: "landscape" },
  { src: "/fotos/cabana_noche.avif", alt: "Cabaña iluminada de noche", aspect: "landscape" },
  { src: "/fotos/chalet.avif", alt: "Chalet en el valle", aspect: "landscape" },
  { src: "/fotos/evento_khalessi_2.avif", alt: "Evento en el valle", aspect: "landscape" },
  { src: "/fotos/evento_2.avif", alt: "Celebración con invitados", aspect: "landscape" },
  { src: "/fotos/evento_3.avif", alt: "Espacio de eventos", aspect: "landscape" },
];

// Fotos por propiedad — SOLO la casa (la Cabaña va aparte, ver CABANA_PHOTOS)
export const PROPERTY_PHOTOS: Record<string, Photo[]> = {
  "casa-grande": [
    { src: "/fotos/casa_grande.avif", alt: "Casa Principal al atardecer", aspect: "landscape" },
    { src: "/casa grande/frontal_1.avif", alt: "Frontal de la Casa Principal", aspect: "landscape" },
    { src: "/casa grande/sala_horizontal.avif", alt: "Sala principal", aspect: "landscape" },
    { src: "/casa grande/piscina.avif", alt: "Piscina", aspect: "landscape" },
    { src: "/casa grande/parrilla.avif", alt: "Zona de parrilla", aspect: "landscape" },
    { src: "/casa grande/canchita_futbol.avif", alt: "Cancha de fútbol", aspect: "landscape" },
    { src: "/casa grande/comedor_vertical.avif", alt: "Comedor", aspect: "portrait" },
    { src: "/casa grande/cuarto1_horizontal.avif", alt: "Dormitorio principal con cama King", aspect: "landscape" },
    { src: "/casa grande/cuarto2_horizontal.avif", alt: "Dormitorio múltiple con tres camas de 1 plaza y media", aspect: "landscape" },
    { src: "/casa grande/cuarto3_horizontal.avif", alt: "Dormitorio doble con dos camas de 2 plazas", aspect: "landscape" },
    { src: "/casa grande/cuarto_4.avif", alt: "Habitación con cama de 2 plazas", aspect: "landscape" },
  ],
  chalet: [
    { src: "/chalet/terraza.avif", alt: "Chalet durante el día", aspect: "landscape" },
    { src: "/chalet/piscina.avif", alt: "Piscina del chalet", aspect: "landscape" },
    { src: "/chalet/jacuzzi.avif", alt: "Jacuzzi exterior", aspect: "landscape" },
    { src: "/chalet/mesa_exterior.avif", alt: "Mesa al aire libre", aspect: "landscape" },
    { src: "/chalet/mesa_fulbito.avif", alt: "Mesa de fulbito", aspect: "landscape" },
    { src: "/chalet/cocina.avif", alt: "Cocina", aspect: "landscape" },
    { src: "/chalet/cuarto_grande.avif", alt: "Dormitorio principal con dos camas de 2 plazas", aspect: "landscape" },
    { src: "/chalet/cuarto_grande_bano.avif", alt: "Baño completo del dormitorio principal", aspect: "landscape" },
    { src: "/chalet/cuarto_pequeno_vertical.avif", alt: "Habitación con cama de 2 plazas", aspect: "portrait" },
  ],
};

// La Cabaña — espacio aparte dentro de Casa Principal, exclusivo para grupos 12+ (tarifa 16).
// Frontal primero (cabana_frontal.avif) como portada del espacio.
export const CABANA_PHOTOS: Photo[] = [
  { src: "/fotos/cabana_frontal.avif", alt: "Frontal de la Cabaña", aspect: "landscape" },
  { src: "/cabana/cuarto_cabana_horizontal.avif", alt: "Habitación de la Cabaña", aspect: "landscape" },
  { src: "/cabana/cocina_cabana_vertical.avif", alt: "Cocina de la Cabaña", aspect: "portrait" },
  { src: "/cabana/cabana_bano.avif", alt: "Baño de la Cabaña", aspect: "landscape" },
  { src: "/cabana/jardin_cabana_vertical.avif", alt: "Jardín de la Cabaña", aspect: "portrait" },
  { src: "/cabana/cabana_vista_casa.avif", alt: "Vista de la Cabaña hacia la casa", aspect: "landscape" },
  { src: "/fotos/cabana_noche.avif", alt: "Cabaña iluminada de noche", aspect: "landscape" },
];

// Eventos — khalessi_2 es la portada/hero
export const EVENT_PHOTOS: Photo[] = [
  { src: "/fotos/evento_khalessi_2.avif", alt: "Celebración en el valle", aspect: "landscape" },
  { src: "/fotos/evento_khalessi_3.avif", alt: "Montaje de evento", aspect: "landscape" },
  { src: "/fotos/evento_khalessi_4.avif", alt: "Invitados en el evento", aspect: "landscape" },
  { src: "/fotos/evento_khalessi.avif", alt: "Evento al atardecer", aspect: "landscape" },
  { src: "/fotos/boda_1.avif", alt: "Boda en el valle", aspect: "landscape" },
  { src: "/fotos/boda_2.avif", alt: "Celebración de boda", aspect: "landscape" },
  { src: "/fotos/evento_8.avif", alt: "Montaje de evento en la casa", aspect: "landscape" },
  { src: "/fotos/evento_1.avif", alt: "Evento al aire libre", aspect: "landscape" },
  { src: "/fotos/evento_2.avif", alt: "Celebración con invitados", aspect: "landscape" },
  { src: "/fotos/evento_3.avif", alt: "Espacio de eventos", aspect: "landscape" },
];

// Portada de eventos (hero)
export const EVENT_HERO: Photo = EVENT_PHOTOS[0];

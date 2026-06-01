export type Photo = { src: string; alt: string; aspect?: "landscape" | "portrait" };

export const BRAND_PHOTOS: Photo[] = [
  { src: "/fotos/casa_grande.avif", alt: "Casa Grande al atardecer", aspect: "landscape" },
  { src: "/fotos/cabana_dia.avif", alt: "Cabaña durante el día", aspect: "landscape" },
  { src: "/fotos/cabana_noche.avif", alt: "Cabaña iluminada de noche", aspect: "landscape" },
  { src: "/fotos/evento_1.avif", alt: "Evento al aire libre", aspect: "landscape" },
  { src: "/fotos/evento_2.avif", alt: "Celebración con invitados", aspect: "landscape" },
  { src: "/fotos/evento_3.avif", alt: "Espacio de eventos", aspect: "landscape" },
];

export const PROPERTY_PHOTOS: Record<string, Photo[]> = {
  "casa-grande": [
    { src: "/fotos/casa_grande.avif", alt: "Casa Grande al atardecer", aspect: "landscape" },
    { src: "/casa grande/sala_horizontal.avif", alt: "Sala principal", aspect: "landscape" },
    { src: "/casa grande/vista_piscina_horizontal.avif", alt: "Vista a la piscina", aspect: "landscape" },
    { src: "/casa grande/comedor_vertical.avif", alt: "Comedor", aspect: "portrait" },
    { src: "/casa grande/cuarto2_horizontal.avif", alt: "Habitación doble", aspect: "landscape" },
    { src: "/casa grande/cuarto2_bano_vertical.avif", alt: "Baño habitación", aspect: "portrait" },
    { src: "/casa grande/cuarto3_horizontal.avif", alt: "Otra habitación", aspect: "landscape" },
    { src: "/casa grande/cuarto3_bano_vertical.avif", alt: "Baño en suite", aspect: "portrait" },
    // Cabaña — exclusiva para grupos 12+ (tarifa 16). Pertenece a Casa Grande.
    { src: "/cabana/jardin_cabana_vertical.avif", alt: "Jardín de la Cabaña", aspect: "portrait" },
    { src: "/cabana/cocina_cabana_vertical.avif", alt: "Cocina de la Cabaña", aspect: "portrait" },
    { src: "/cabana/cuarto_cabana_horizontal.avif", alt: "Habitación de la Cabaña", aspect: "landscape" },
    { src: "/cabana/tele_cabana_vertical.avif", alt: "Sala con TV en la Cabaña", aspect: "portrait" },
  ],
  chalet: [
    { src: "/chalet/terraza.avif", alt: "Chalet durante el día", aspect: "landscape" },
    { src: "/chalet/piscina.avif", alt: "Piscina del chalet", aspect: "landscape" },
    { src: "/chalet/jacuzzi.avif", alt: "Jacuzzi exterior", aspect: "landscape" },
    { src: "/chalet/comedor_exterior.avif", alt: "Comedor exterior", aspect: "landscape" },
    { src: "/chalet/mesa_exterior.avif", alt: "Mesa al aire libre", aspect: "landscape" },
    { src: "/chalet/mesa_fulbito.avif", alt: "Mesa de fulbito", aspect: "landscape" },
    { src: "/chalet/cocina.avif", alt: "Cocina", aspect: "landscape" },
    { src: "/chalet/cuarto_grande.avif", alt: "Cuarto principal", aspect: "landscape" },
    { src: "/chalet/cuarto_grande_bano.avif", alt: "Baño cuarto principal", aspect: "landscape" },
    { src: "/chalet/cuarto_pequeno_vertical.avif", alt: "Cuarto adicional", aspect: "portrait" },
  ],
};

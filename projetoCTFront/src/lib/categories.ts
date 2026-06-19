export const CATEGORIES = [
  "MF Combate",
  "Taekwondo",
  "Alto Rendimento",
  "Funcional",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Each category gets a distinct accent. Tokens are defined in styles.css.
export const CATEGORY_STYLES: Record<
  Category,
  { badge: string; ring: string; dot: string; label: string }
> = {
  "MF Combate": {
    badge: "bg-cat-combat/15 text-cat-combat border-cat-combat/30",
    ring: "border-l-cat-combat",
    dot: "bg-cat-combat",
    label: "MF Combate",
  },
  Taekwondo: {
    badge: "bg-cat-taekwondo/15 text-cat-taekwondo border-cat-taekwondo/30",
    ring: "border-l-cat-taekwondo",
    dot: "bg-cat-taekwondo",
    label: "Taekwondo",
  },
  "Alto Rendimento": {
    badge: "bg-cat-elite/15 text-cat-elite border-cat-elite/30",
    ring: "border-l-cat-elite",
    dot: "bg-cat-elite",
    label: "Alto Rendimento",
  },
  Funcional: {
    badge: "bg-cat-funcional/15 text-cat-funcional border-cat-funcional/30",
    ring: "border-l-cat-funcional",
    dot: "bg-cat-funcional",
    label: "Funcional",
  },
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  typology: string;
  place: string;
  year: string;
  area: string;
  status: string;
  /** Key image, used on the card and the detail hero. */
  cover: string;
  /** Detail-page sequence, including the cover. */
  plates: { src: string; caption: string; span: "full" | "half" }[];
  /** Two or three short paragraphs. Concrete, not lyrical. */
  body: string[];
  credits: [string, string][];
};

export const projects: Project[] = [
  {
    slug: "vault-house",
    index: "01",
    title: "Vault House",
    typology: "Private Residence",
    place: "Skagen, DK",
    year: "2024",
    area: "310 m²",
    status: "Completed",
    cover: "arches",
    plates: [
      { src: "arches", caption: "The spine, looking north toward the dune line", span: "full" },
      { src: "cubic", caption: "South elevation, late afternoon", span: "half" },
      { src: "corner", caption: "Junction of spine and the western cabin", span: "half" },
    ],
    body: [
      "A house for a retired boat-builder, set back from the dune line where the light arrives twice — once directly, once off the water. The plan is a single vaulted spine with rooms hung from it like cabins from a keel.",
      "Lime plaster over blockwork throughout. There is no paint anywhere in the building, and no applied finish that could not be repaired by one person with a bucket.",
    ],
    credits: [
      ["Client", "Private"],
      ["Structure", "Kolding Ingeniører"],
      ["Contractor", "Brdr. Wammen"],
      ["Photography", "Studio Halvard"],
    ],
  },
  {
    slug: "kiln",
    index: "02",
    title: "Kiln",
    typology: "Ceramics Museum",
    place: "Porto, PT",
    year: "2023",
    area: "2,400 m²",
    status: "Completed",
    cover: "terracotta",
    plates: [
      { src: "terracotta", caption: "North wall, stack bond stepping one half-brick every third course", span: "full" },
      { src: "louvers", caption: "Upper gallery, south light", span: "half" },
      { src: "museum", caption: "Approach from the Rua do Ouro", span: "half" },
    ],
    body: [
      "The museum stands on the footprint of the brickworks it replaces and re-lays 340,000 of its bricks. Nothing was trucked off site except the steel.",
      "The curved north wall steps out one half-brick every third course, so the facade reads as a single fired surface rather than a wall with windows cut into it. The stepping also shades the glazing behind it for nine months of the year.",
    ],
    credits: [
      ["Client", "Câmara Municipal do Porto"],
      ["Structure", "Betar Consultores"],
      ["Masonry", "Oficina Cerâmica Vale"],
      ["Photography", "Studio Halvard"],
    ],
  },
  {
    slug: "nave",
    index: "03",
    title: "Nave",
    typology: "Concert Hall",
    place: "Copenhagen, DK",
    year: "2022",
    area: "1,850 m²",
    status: "Completed",
    cover: "cathedral",
    plates: [
      { src: "cathedral", caption: "The nave, retuned to 1.9 seconds", span: "full" },
      { src: "dome", caption: "Technical gallery, formerly the organ loft", span: "half" },
      { src: "loft", caption: "Rehearsal room, undercroft", span: "half" },
    ],
    body: [
      "A 1930s parish church, decommissioned in 2016, converted to a four-hundred-seat hall. We removed nothing.",
      "The organ loft became the technical gallery. The nave's reverberation — 4.2 seconds, unusable for speech — was tuned to 1.9 with felt banners that retract into the clerestory when the room is empty. On a quiet Tuesday it is still a church.",
    ],
    credits: [
      ["Client", "Københavns Kommune"],
      ["Acoustics", "Gade & Mortensen"],
      ["Heritage", "Raadvad Centre"],
      ["Photography", "Studio Halvard"],
    ],
  },
  {
    slug: "nine-terraces",
    index: "04",
    title: "Nine Terraces",
    typology: "Social Housing",
    place: "Rotterdam, NL",
    year: "2024",
    area: "11,200 m²",
    status: "Completed",
    cover: "terraces",
    plates: [
      { src: "terraces", caption: "West stack, second summer", span: "full" },
      { src: "dusk", caption: "Ground floor workshops", span: "half" },
      { src: "louvers", caption: "Circulation deck, east end", span: "half" },
    ],
    body: [
      "Ninety-six apartments over a working ground floor. Every unit has an outdoor room deep enough to eat in — the only thing the residents' group asked for, and the only thing that mattered.",
      "The planting is maintained by the association under a covenant that outlives the building's first mortgage. We designed the irrigation to be legible from the walkway so that a failure is visible before it is expensive.",
    ],
    credits: [
      ["Client", "Woonstad Rotterdam"],
      ["Landscape", "Bureau Vlaming"],
      ["Structure", "IMd Raadgevende"],
      ["Photography", "Studio Halvard"],
    ],
  },
  {
    slug: "salt",
    index: "05",
    title: "Salt",
    typology: "Art Gallery",
    place: "Marseille, FR",
    year: "2023",
    area: "1,140 m²",
    status: "Completed",
    cover: "cantilever",
    plates: [
      { src: "cantilever", caption: "The overhang, eleven metres", span: "full" },
      { src: "museum", caption: "Upper hall", span: "half" },
      { src: "cubic", caption: "Approach across the pan", span: "half" },
    ],
    body: [
      "A gallery for a private collection of post-war Mediterranean painting, cantilevered eleven metres over a disused salt pan.",
      "The overhang is not structural bravado. It holds the reflecting pool below in permanent shade, which stops the algae and keeps the water black — so the building reads twice from the approach road, and the paintings upstairs never see a bounce.",
    ],
    credits: [
      ["Client", "Fondation Aubanel"],
      ["Structure", "Batiserf"],
      ["Lighting", "8'18\""],
      ["Photography", "Studio Halvard"],
    ],
  },
  {
    slug: "lattice",
    index: "06",
    title: "Lattice",
    typology: "Temporary Pavilion",
    place: "Seoul, KR",
    year: "2021",
    area: "260 m²",
    status: "Dismantled",
    cover: "lattice",
    plates: [
      { src: "lattice", caption: "Canopy from below, solar noon", span: "full" },
      { src: "tower", caption: "Assembly, day six", span: "half" },
      { src: "skyline", caption: "Site, Jung-gu", span: "half" },
    ],
    body: [
      "A pavilion for the Seoul Biennale, built in eleven days from 4,200 metres of steel reinforcing bar and taken down in three.",
      "The lattice density was solved to cast exactly fifty per cent shade at solar noon on the equinox. Every component went back into the supplier's stock. The drawings were published so it can be built again by anyone who wants it.",
    ],
    credits: [
      ["Client", "Seoul Biennale"],
      ["Fabrication", "Hanmi Steel"],
      ["Engineering", "Eom Structural"],
      ["Photography", "Studio Halvard"],
    ],
  },
];

export const bySlug = (slug?: string) => projects.find((p) => p.slug === slug);

export const nextOf = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};

/** Practice disciplines — drives the hover-reveal index list. */
export const disciplines = [
  { n: "01", name: "Housing", count: "24 projects", image: "terraces" },
  { n: "02", name: "Cultural & Civic", count: "11 projects", image: "cathedral" },
  { n: "03", name: "Adaptive Reuse", count: "18 projects", image: "loft" },
  { n: "04", name: "Private Houses", count: "31 projects", image: "cubic" },
  { n: "05", name: "Exhibition & Temporary", count: "9 projects", image: "lattice" },
  { n: "06", name: "Research & Advocacy", count: "Ongoing", image: "dome" },
];

export const recognition = [
  "Mies van der Rohe Award — Nominee, 2024",
  "RIBA International Prize — Shortlist, 2023",
  "Dezeen Awards — Civic Building of the Year, 2023",
  "Nordic Timber Prize, 2022",
  "AR Emerging Architecture — Highly Commended, 2019",
  "Danish Design Award — Better Living, 2021",
  "Wallpaper* Design Awards — Best New Public House, 2023",
  "EU Prize for Contemporary Architecture — Longlist, 2022",
];

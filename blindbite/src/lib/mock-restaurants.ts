// Hardcoded list used by the recommender search autocomplete.
export type MockRestaurant = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
  image: string; // imported asset path
  vibe: string;
};

// Served from public/mock/ as static assets (Next.js public dir).
const octopus = "/mock/octopus.jpg";
const matcha = "/mock/matcha.jpg";
const wine = "/mock/wine.jpg";
const ramen = "/mock/ramen.jpg";
const pastel = "/mock/pastel.jpg";
const dumplings = "/mock/dumplings.jpg";

export const MOCK_IMAGES = { octopus, matcha, wine, ramen, pastel, dumplings };

export const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    name: "o pescador",
    address: "soho, london",
    latitude: 51.5135,
    longitude: -0.1340,
    tags: ["portuguese", "seafood", "candlelit"],
    image: octopus,
    vibe: "a tiny portuguese room where the octopus has been on the menu since '94.",
  },
  {
    name: "kissa tanto",
    address: "fitzrovia, london",
    latitude: 51.5189,
    longitude: -0.1364,
    tags: ["japanese", "matcha", "sunlit"],
    image: matcha,
    vibe: "all wood and morning light. their matcha actually tastes like matcha.",
  },
  {
    name: "noble rot",
    address: "lamb's conduit, london",
    latitude: 51.5215,
    longitude: -0.1183,
    tags: ["wine", "slow", "intimate"],
    image: wine,
    vibe: "candles, marble, orange wine. the kind of place tuesday belongs to.",
  },
  {
    name: "koya bar",
    address: "soho, london",
    latitude: 51.5126,
    longitude: -0.1349,
    tags: ["ramen", "late night", "comfort"],
    image: ramen,
    vibe: "small, hot, perfect after midnight. the broth is the whole point.",
  },
  {
    name: "café de nata",
    address: "covent garden, london",
    latitude: 51.5117,
    longitude: -0.1240,
    tags: ["pastry", "cinnamon", "morning"],
    image: pastel,
    vibe: "lisbon-trained baker. the custard sets like it should.",
  },
  {
    name: "dumplings' legend",
    address: "chinatown, london",
    latitude: 51.5114,
    longitude: -0.1310,
    tags: ["dim sum", "marble tables", "lively"],
    image: dumplings,
    vibe: "they pleat each one by hand behind the glass. xiao long bao that bursts properly.",
  },
];
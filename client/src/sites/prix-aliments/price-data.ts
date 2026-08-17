export type StoreId = "carrefour" | "intermarche" | "aldi" | "colruyt";

export type ProductCategory =
  | "Tous"
  | "Fruits & légumes"
  | "Frais"
  | "Épicerie"
  | "Protéines";

export type StoreOffer = {
  collectedAt: string;
  previousPrice?: number;
  price: number;
  storeId: StoreId;
  unitPrice: number;
  unitSuffix: string;
};

export type ComparedProduct = {
  brand: string;
  category: Exclude<ProductCategory, "Tous">;
  emoji: string;
  format: string;
  id: string;
  name: string;
  offers: StoreOffer[];
  searchTerms: string[];
};

export const STORE_NAMES: Record<StoreId, string> = {
  aldi: "ALDI",
  carrefour: "Carrefour",
  colruyt: "Colruyt",
  intermarche: "Intermarché",
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Tous",
  "Fruits & légumes",
  "Frais",
  "Épicerie",
  "Protéines",
];

const RELEVANT_DATE = "16 août 2026";

export const COMPARED_PRODUCTS: ComparedProduct[] = [
  {
    brand: "Marque distributeur",
    category: "Frais",
    emoji: "🥛",
    format: "Brique 1 L",
    id: "lait-demi-ecreme",
    name: "Lait demi-écrémé",
    searchTerms: ["lait", "demi écrémé", "brique", "lactose"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 1.05,
        storeId: "carrefour",
        unitPrice: 1.05,
        unitSuffix: "/ L",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.02,
        storeId: "intermarche",
        unitPrice: 1.02,
        unitSuffix: "/ L",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 0.95,
        storeId: "aldi",
        unitPrice: 0.95,
        unitSuffix: "/ L",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 0.99,
        storeId: "colruyt",
        unitPrice: 0.99,
        unitSuffix: "/ L",
      },
    ],
  },
  {
    brand: "Origine France",
    category: "Protéines",
    emoji: "🥚",
    format: "Boite de 12",
    id: "oeufs-plein-air",
    name: "Œufs plein air",
    searchTerms: [
      "oeuf",
      "oeufs",
      "œuf",
      "œufs",
      "plein air",
      "boîte",
      "protéine",
    ],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 3.49,
        storeId: "carrefour",
        unitPrice: 0.29,
        unitSuffix: "/ oeuf",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 3.29,
        storeId: "intermarche",
        unitPrice: 0.27,
        unitSuffix: "/ oeuf",
      },
      {
        collectedAt: RELEVANT_DATE,
        previousPrice: 3.09,
        price: 2.79,
        storeId: "aldi",
        unitPrice: 0.23,
        unitSuffix: "/ oeuf",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 3.15,
        storeId: "colruyt",
        unitPrice: 0.26,
        unitSuffix: "/ oeuf",
      },
    ],
  },
  {
    brand: "Vrac",
    category: "Fruits & légumes",
    emoji: "🍌",
    format: "Au kilogramme",
    id: "bananes",
    name: "Bananes",
    searchTerms: ["banane", "bananes", "fruit", "vrac"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 1.99,
        storeId: "carrefour",
        unitPrice: 1.99,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        previousPrice: 2.09,
        price: 1.89,
        storeId: "intermarche",
        unitPrice: 1.89,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.69,
        storeId: "aldi",
        unitPrice: 1.69,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.75,
        storeId: "colruyt",
        unitPrice: 1.75,
        unitSuffix: "/ kg",
      },
    ],
  },
  {
    brand: "Marque distributeur",
    category: "Épicerie",
    emoji: "🌾",
    format: "Sachet 500 g",
    id: "flocons-avoine",
    name: "Flocons d'avoine",
    searchTerms: ["avoine", "flocons", "céréales", "petit déjeuner"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 1.69,
        storeId: "carrefour",
        unitPrice: 3.38,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.45,
        storeId: "intermarche",
        unitPrice: 2.9,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.19,
        storeId: "aldi",
        unitPrice: 2.38,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.35,
        storeId: "colruyt",
        unitPrice: 2.7,
        unitSuffix: "/ kg",
      },
    ],
  },
  {
    brand: "Filets nature",
    category: "Protéines",
    emoji: "🍗",
    format: "Barquette 1 kg",
    id: "filets-poulet",
    name: "Filets de poulet",
    searchTerms: ["poulet", "filet", "volaille", "viande", "protéine"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 11.9,
        storeId: "carrefour",
        unitPrice: 11.9,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        previousPrice: 11.79,
        price: 10.99,
        storeId: "intermarche",
        unitPrice: 10.99,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 9.89,
        storeId: "aldi",
        unitPrice: 9.89,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 10.45,
        storeId: "colruyt",
        unitPrice: 10.45,
        unitSuffix: "/ kg",
      },
    ],
  },
  {
    brand: "Marque distributeur",
    category: "Épicerie",
    emoji: "🍝",
    format: "Paquet 500 g",
    id: "penne-rigate",
    name: "Penne rigate",
    searchTerms: ["pâtes", "pates", "pasta", "penne", "rigate", "féculent"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 1.25,
        storeId: "carrefour",
        unitPrice: 2.5,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.14,
        storeId: "intermarche",
        unitPrice: 2.28,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 0.89,
        storeId: "aldi",
        unitPrice: 1.78,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 0.99,
        storeId: "colruyt",
        unitPrice: 1.98,
        unitSuffix: "/ kg",
      },
    ],
  },
  {
    brand: "Nature",
    category: "Frais",
    emoji: "🥣",
    format: "4 pots - 500 g",
    id: "yaourt-grec",
    name: "Yaourt a la grecque",
    searchTerms: ["yaourt", "grec", "yogourt", "laitier", "nature"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        previousPrice: 2.39,
        price: 2.09,
        storeId: "carrefour",
        unitPrice: 4.18,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 2.19,
        storeId: "intermarche",
        unitPrice: 4.38,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.79,
        storeId: "aldi",
        unitPrice: 3.58,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 1.89,
        storeId: "colruyt",
        unitPrice: 3.78,
        unitSuffix: "/ kg",
      },
    ],
  },
  {
    brand: "Long grain",
    category: "Épicerie",
    emoji: "🍚",
    format: "Sachet 1 kg",
    id: "riz-basmati",
    name: "Riz basmati",
    searchTerms: ["riz", "basmati", "long grain", "féculent"],
    offers: [
      {
        collectedAt: RELEVANT_DATE,
        price: 2.75,
        storeId: "carrefour",
        unitPrice: 2.75,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 2.59,
        storeId: "intermarche",
        unitPrice: 2.59,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        price: 2.29,
        storeId: "aldi",
        unitPrice: 2.29,
        unitSuffix: "/ kg",
      },
      {
        collectedAt: RELEVANT_DATE,
        previousPrice: 2.69,
        price: 2.39,
        storeId: "colruyt",
        unitPrice: 2.39,
        unitSuffix: "/ kg",
      },
    ],
  },
];

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export function filterComparedProducts(
  products: ComparedProduct[],
  query: string,
  category: ProductCategory,
) {
  const normalizedQuery = normalizeSearchValue(query);

  return products.filter((product) => {
    const matchesCategory =
      category === "Tous" || product.category === category;
    const searchableContent = normalizeSearchValue(
      [
        product.name,
        product.brand,
        product.format,
        ...product.searchTerms,
      ].join(" "),
    );

    return matchesCategory && searchableContent.includes(normalizedQuery);
  });
}

export function sortedOffers(product: ComparedProduct) {
  return [...product.offers].sort(
    (first, second) => first.price - second.price,
  );
}

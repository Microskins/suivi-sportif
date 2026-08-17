import type { StoreId } from "./price-data";

export type SelectedStoreLocation = {
  address: string;
  city: string;
  countryCode: "BE" | "FR";
  countryName: string;
  displayName: string;
  note?: string;
  officialPageUrl: string;
  postalCode: string;
  storeId: StoreId;
};

export const COMPARISON_AREA = {
  city: "Escautpont",
  label: "Escautpont & environs",
  postalCode: "59278",
} as const;

export const SELECTED_STORE_LOCATIONS: Record<StoreId, SelectedStoreLocation> =
  {
    aldi: {
      address: "260 rue Jean Jaurès",
      city: "Fresnes-sur-Escaut",
      countryCode: "FR",
      countryName: "France",
      displayName: "ALDI Fresnes-sur-Escaut",
      note: "Point de vente officiel trouvé pour le secteur d’Escautpont.",
      officialPageUrl:
        "https://www.aldi.fr/magasins-et-horaires-d-ouverture/fresnes-sur-escaut/260-rue-jean-jaures/3435518.html",
      postalCode: "59970",
      storeId: "aldi",
    },
    carrefour: {
      address: "Avenue de la Liberté, Le Tourniquet",
      city: "Condé-sur-l’Escaut",
      countryCode: "FR",
      countryName: "France",
      displayName: "Carrefour Condé-sur-l’Escaut",
      officialPageUrl: "https://www.carrefour.fr/magasin/conde-sur-l-escaut",
      postalCode: "59163",
      storeId: "carrefour",
    },
    colruyt: {
      address: "Rue Neuve Chaussée 157",
      city: "Péruwelz",
      countryCode: "BE",
      countryName: "Belgique",
      displayName: "Colruyt Péruwelz New",
      note: "Point de vente transfrontalier en Belgique.",
      officialPageUrl:
        "https://www.colruyt.be/fr/recherche-de-magasin/colruyt-peruwelz",
      postalCode: "7600",
      storeId: "colruyt",
    },
    intermarche: {
      address: "10 rue Jean Jaurès",
      city: "Escautpont",
      countryCode: "FR",
      countryName: "France",
      displayName: "Intermarché Super Escautpont",
      officialPageUrl:
        "https://www.intermarche.com/magasins/07151/escautpont-59278/infos-pratiques",
      postalCode: "59278",
      storeId: "intermarche",
    },
  };

export const SELECTED_STORES = [
  SELECTED_STORE_LOCATIONS.intermarche,
  SELECTED_STORE_LOCATIONS.carrefour,
  SELECTED_STORE_LOCATIONS.aldi,
  SELECTED_STORE_LOCATIONS.colruyt,
];

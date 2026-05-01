export type AreaKey = "hongdae" | "hapjeong" | "yeonnam" | "mangwon";

export type IntentKey = "lunch" | "cafe" | "walk" | "dinner";

export type ActionKey =
  | "lunch"
  | "dinner"
  | "cafe"
  | "dessert"
  | "walk"
  | "culture";

export type PlaceCategory =
  | "restaurant"
  | "cafe"
  | "dessert"
  | "walk"
  | "culture"
  | "attraction";

export type Place = {
  id: number;
  externalId: string;
  name: string;
  area: AreaKey;
  category: PlaceCategory;
  address: string;
  lat: number;
  lng: number;
  manualScore: number;
  tags: string[];
  timeSlots: ActionKey[];
  placeUrl: string;
  isActive: boolean;
};

export type RecommendedPlace = Place & {
  distanceMeters?: number;
  reason: string;
};

export type RecommendationOption = {
  key: ActionKey;
  label: string;
  description: string;
  reason: string;
  places: RecommendedPlace[];
};

export type RecommendationResponse = {
  meta: {
    area: AreaKey;
    currentTime: string;
  };
  options: RecommendationOption[];
};

export type RecommendRequest = {
  lat?: number;
  lng?: number;
  area?: AreaKey;
  intent?: IntentKey;
  currentTime?: string;
};

import {
  ACTION_DESCRIPTIONS,
  ACTION_LABELS,
  DEFAULT_ACTIONS,
  TIME_SLOT_ACTIONS,
} from "./constants";
import { getDistanceMeters } from "./geo";
import { createSupabaseClient, type PlacesRow } from "./supabase";
import type {
  ActionKey,
  AreaKey,
  IntentKey,
  Place,
  PlaceCategory,
  RecommendRequest,
  RecommendationOption,
  RecommendationResponse,
  RecommendedPlace,
} from "./types";

const INTENT_TO_ACTION: Record<IntentKey, ActionKey> = {
  lunch: "lunch",
  cafe: "cafe",
  walk: "walk",
  dinner: "dinner",
};

const ACTION_CATEGORIES: Record<ActionKey, PlaceCategory[]> = {
  lunch: ["restaurant"],
  dinner: ["restaurant"],
  cafe: ["cafe"],
  dessert: ["dessert", "cafe"],
  walk: ["walk", "attraction"],
  culture: ["culture", "attraction", "walk"],
};

export async function getRecommendation(
  request: RecommendRequest,
): Promise<RecommendationResponse> {
  const places = await fetchActivePlaces();

  return buildRecommendation(request, places);
}

export function buildRecommendation(
  request: RecommendRequest,
  places: Place[],
): RecommendationResponse {
  const area = request.area ?? "hongdae";
  const currentTime = getValidCurrentTime(request.currentTime);
  const currentDate = new Date(currentTime);
  const timeSlot = getCurrentTimeSlot(currentDate);
  const actions = getActionOptions(timeSlot.actions, request.intent);

  return {
    meta: {
      area,
      currentTime,
      usesCurrentLocation:
        typeof request.lat === "number" && typeof request.lng === "number",
    },
    options: actions.map((action) =>
      buildRecommendationOption({
        action,
        area,
        lat: request.lat,
        lng: request.lng,
        places,
        timeReason: timeSlot.reason,
        variant: request.variant ?? 0,
      }),
    ),
  };
}

async function fetchActivePlaces() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      "id, external_id, name, area, category, address, lat, lng, manual_score, tags, time_slots, place_url, is_active, created_at",
    )
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }

  return (data ?? []).map(toPlace).filter(isPlace);
}

function buildRecommendationOption({
  action,
  area,
  lat,
  lng,
  places,
  timeReason,
  variant,
}: {
  action: ActionKey;
  area: AreaKey;
  lat?: number;
  lng?: number;
  places: Place[];
  timeReason: string;
  variant: number;
}): RecommendationOption {
  return {
    key: action,
    label: ACTION_LABELS[action],
    description: ACTION_DESCRIPTIONS[action],
    reason: timeReason,
    places: getPlacesForAction({ action, area, lat, lng, places, variant }),
  };
}

function getPlacesForAction({
  action,
  area,
  lat,
  lng,
  places,
  variant,
}: {
  action: ActionKey;
  area: AreaKey;
  lat?: number;
  lng?: number;
  places: Place[];
  variant: number;
}): RecommendedPlace[] {
  const categories = ACTION_CATEGORIES[action];
  const matchingPlaces = places.filter(
    (place) =>
      categories.includes(place.category) || place.timeSlots.includes(action),
  );
  const areaMatchingPlaces = matchingPlaces.filter(
    (place) => place.area === area,
  );
  const areaPlaces = places.filter((place) => place.area === area);
  const candidates =
    areaMatchingPlaces.length > 0
      ? areaMatchingPlaces
      : matchingPlaces.length > 0
        ? matchingPlaces
        : areaPlaces.length > 0
          ? areaPlaces
          : places;

  const rankedCandidates = candidates
    .map((place) => decoratePlace(place, action, lat, lng))
    .sort((a, b) => getPlaceScore(b, area) - getPlaceScore(a, area));

  const topPool = rankedCandidates.slice(0, Math.min(6, rankedCandidates.length));

  return pickFromTopPool(topPool, action, variant);
}

function decoratePlace(
  place: Place,
  action: ActionKey,
  lat?: number,
  lng?: number,
): RecommendedPlace {
  const hasLocation = typeof lat === "number" && typeof lng === "number";
  const distanceMeters = hasLocation
    ? getDistanceMeters({ lat, lng }, { lat: place.lat, lng: place.lng })
    : undefined;

  return {
    ...place,
    distanceMeters,
    reason: getPlaceReason(action, distanceMeters),
  };
}

function getPlaceScore(place: RecommendedPlace, requestedArea: AreaKey) {
  const areaBoost = place.area === requestedArea ? 18 : 0;
  const distancePenalty =
    typeof place.distanceMeters === "number"
      ? Math.min(place.distanceMeters / 80, 45)
      : 0;

  return place.manualScore + areaBoost - distancePenalty;
}

function getPlaceReason(action: ActionKey, distanceMeters?: number) {
  const distancePrefix =
    typeof distanceMeters === "number" && distanceMeters <= 700
      ? "가깝고 "
      : "";

  if (action === "lunch" || action === "dinner") {
    return `${distancePrefix}식사 흐름으로 이어가기 좋아요.`;
  }

  if (action === "cafe" || action === "dessert") {
    return `${distancePrefix}잠깐 쉬면서 대화하기 좋아요.`;
  }

  return `${distancePrefix}부담 없이 걷고 구경하기 좋아요.`;
}

function getActionOptions(
  baseActions: ActionKey[],
  intent?: IntentKey,
) {
  const preferred = intent ? INTENT_TO_ACTION[intent] : undefined;
  const merged = preferred
    ? [preferred, ...baseActions, ...DEFAULT_ACTIONS]
    : [...baseActions, ...DEFAULT_ACTIONS];
  const uniqueActions = Array.from(new Set(merged));

  return uniqueActions.slice(0, 3);
}

function getCurrentTimeSlot(date: Date) {
  const minute = getSeoulMinuteOfDay(date);

  return (
    TIME_SLOT_ACTIONS.find(
      (slot) => minute >= slot.startMinute && minute < slot.endMinute,
    ) ?? {
      actions: DEFAULT_ACTIONS,
      reason: "현재 시간에는 부담 없이 이어가기 좋은 선택지를 먼저 보여줍니다.",
    }
  );
}

function getSeoulMinuteOfDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  return hour * 60 + minute;
}

function getValidCurrentTime(currentTime?: string) {
  const date = currentTime ? new Date(currentTime) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return currentTime ?? date.toISOString();
}

function pickFromTopPool(
  places: RecommendedPlace[],
  action: ActionKey,
  variant: number,
) {
  if (places.length <= 3) {
    return places;
  }

  return shufflePlaces(places, action, variant).slice(0, 3);
}

function shufflePlaces(
  places: RecommendedPlace[],
  action: ActionKey,
  variant: number,
) {
  return places
    .map((place, index) => ({
      place,
      rank: getStableRank(`${action}-${variant}-${place.id}-${index}`),
    }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ place }) => place);
}

function getStableRank(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function toPlace(row: PlacesRow): Place | null {
  const area = toArea(row.area);
  const category = toCategory(row.category);

  if (!area || !category) {
    return null;
  }

  return {
    id: row.id,
    externalId: row.external_id ?? `places-${row.id}`,
    name: row.name,
    area,
    category,
    address: row.address ?? "",
    lat: row.lat,
    lng: row.lng,
    manualScore: row.manual_score,
    tags: row.tags ?? [],
    timeSlots: (row.time_slots ?? []).map(toAction).filter(isAction),
    placeUrl: row.place_url ?? createMapSearchUrl(row.name),
    isActive: row.is_active,
  };
}

function createMapSearchUrl(name: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
}

function toArea(value: string): AreaKey | null {
  if (
    value === "hongdae" ||
    value === "hapjeong" ||
    value === "yeonnam" ||
    value === "mangwon"
  ) {
    return value;
  }

  return null;
}

function toCategory(value: string): PlaceCategory | null {
  if (
    value === "restaurant" ||
    value === "cafe" ||
    value === "dessert" ||
    value === "walk" ||
    value === "culture" ||
    value === "attraction"
  ) {
    return value;
  }

  return null;
}

function toAction(value: string): ActionKey | null {
  if (
    value === "lunch" ||
    value === "dinner" ||
    value === "cafe" ||
    value === "dessert" ||
    value === "walk" ||
    value === "culture"
  ) {
    return value;
  }

  return null;
}

function isAction(value: ActionKey | null): value is ActionKey {
  return value !== null;
}

function isPlace(value: Place | null): value is Place {
  return value !== null;
}

import type { KakaoCategoryMapping } from "../../scripts/config/categories.ts";
import type { AreaKey, ActionKey, PlaceCategory } from "./types";
import type { KakaoPlaceDocument } from "./kakao-local";

export type NormalizedPlaceRecord = {
  external_id: string;
  name: string;
  area: AreaKey;
  category: PlaceCategory;
  address: string;
  lat: number;
  lng: number;
  manual_score: number;
  tags: string[];
  time_slots: ActionKey[];
  place_url: string;
  is_active: boolean;
};

export type NormalizeKakaoPlaceInput = {
  document: KakaoPlaceDocument;
  area: AreaKey;
  mapping: KakaoCategoryMapping;
};

export function normalizeKakaoPlace({
  document,
  area,
  mapping,
}: NormalizeKakaoPlaceInput): NormalizedPlaceRecord | null {
  const lat = Number(document.y);
  const lng = Number(document.x);

  if (!document.id || !document.place_name || !Number.isFinite(lat)) {
    return null;
  }

  if (!Number.isFinite(lng)) {
    return null;
  }

  return {
    external_id: document.id,
    name: document.place_name,
    area,
    category: mapping.category,
    address: document.road_address_name || document.address_name || "",
    lat,
    lng,
    manual_score: 50,
    tags: mapping.tags,
    time_slots: mapping.timeSlots,
    place_url: document.place_url,
    is_active: true,
  };
}

export function dedupeNormalizedPlaces(records: NormalizedPlaceRecord[]) {
  const seenExternalIds = new Set<string>();
  const seenLocationKeys = new Set<string>();
  const deduped: NormalizedPlaceRecord[] = [];

  for (const record of records) {
    const externalKey = record.external_id.trim();
    const locationKey = [
      record.name.trim().toLowerCase(),
      record.lat.toFixed(6),
      record.lng.toFixed(6),
    ].join("|");

    if (seenExternalIds.has(externalKey) || seenLocationKeys.has(locationKey)) {
      continue;
    }

    seenExternalIds.add(externalKey);
    seenLocationKeys.add(locationKey);
    deduped.push(record);
  }

  return deduped;
}

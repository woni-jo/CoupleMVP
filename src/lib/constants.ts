import type { ActionKey, AreaKey, IntentKey, PlaceCategory } from "./types";

export const AREAS: ReadonlyArray<{ key: AreaKey; label: string }> = [
  { key: "hongdae", label: "홍대" },
  { key: "hapjeong", label: "합정" },
  { key: "yeonnam", label: "연남" },
  { key: "mangwon", label: "망원" },
];

export const INTENTS: ReadonlyArray<{
  key: IntentKey;
  label: string;
  helper: string;
}> = [
  { key: "lunch", label: "밥 먹고 싶어요", helper: "맛있는 식사" },
  { key: "cafe", label: "카페 가고 싶어요", helper: "쉬면서 대화" },
  { key: "walk", label: "산책/구경하고 싶어요", helper: "가볍게 이동" },
  { key: "dinner", label: "저녁 먹고 싶어요", helper: "분위기 있는 식사" },
];

export const ACTION_LABELS: Record<ActionKey, string> = {
  lunch: "밥집",
  dinner: "저녁",
  cafe: "카페",
  dessert: "디저트",
  walk: "산책/구경",
  culture: "전시/문화",
};

export const ACTION_DESCRIPTIONS: Record<ActionKey, string> = {
  lunch: "지금 시간에 가기 좋은 식사 장소",
  dinner: "데이트를 마무리하기 좋은 저녁 장소",
  cafe: "쉬면서 대화하기 좋은 카페",
  dessert: "가볍게 단맛을 채우기 좋은 곳",
  walk: "걷고 구경하기 좋은 코스",
  culture: "짧게 둘러보기 좋은 문화 공간",
};

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  restaurant: "식사",
  cafe: "카페",
  dessert: "디저트",
  walk: "산책",
  culture: "문화",
  attraction: "구경",
};

export const TIME_SLOT_ACTIONS: ReadonlyArray<{
  startMinute: number;
  endMinute: number;
  actions: ActionKey[];
  reason: string;
}> = [
  {
    startMinute: 11 * 60,
    endMinute: 13 * 60,
    actions: ["lunch", "cafe", "walk"],
    reason: "점심 시간대라 식사 선택지를 먼저 보여줍니다.",
  },
  {
    startMinute: 13 * 60,
    endMinute: 17 * 60,
    actions: ["cafe", "dessert", "walk"],
    reason: "오후에는 쉬어가기 좋은 카페와 가벼운 구경을 우선합니다.",
  },
  {
    startMinute: 17 * 60,
    endMinute: 20 * 60,
    actions: ["dinner", "cafe", "walk"],
    reason: "저녁 시간대라 식사 후 가볍게 이어갈 선택지를 함께 보여줍니다.",
  },
  {
    startMinute: 20 * 60,
    endMinute: 22 * 60 + 30,
    actions: ["dessert", "walk", "culture"],
    reason: "늦은 시간에는 부담이 적은 디저트와 산책 선택지를 우선합니다.",
  },
];

export const DEFAULT_ACTIONS: ActionKey[] = ["cafe", "walk", "dinner"];

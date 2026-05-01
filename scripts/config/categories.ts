import type { ActionKey, PlaceCategory } from "../../src/lib/types.ts";

export type KakaoCategoryMapping = {
  code: "FD6" | "CE7" | "CT1" | "AT4";
  category: PlaceCategory;
  tags: string[];
  timeSlots: ActionKey[];
};

export const KAKAO_CATEGORY_MAPPINGS: KakaoCategoryMapping[] = [
  {
    code: "FD6",
    category: "restaurant",
    tags: ["식사"],
    timeSlots: ["lunch", "dinner"],
  },
  {
    code: "CE7",
    category: "cafe",
    tags: ["카페", "대화"],
    timeSlots: ["cafe", "dessert"],
  },
  {
    code: "CT1",
    category: "culture",
    tags: ["문화", "실내"],
    timeSlots: ["culture", "walk"],
  },
  {
    code: "AT4",
    category: "attraction",
    tags: ["구경", "산책"],
    timeSlots: ["walk", "culture"],
  },
];

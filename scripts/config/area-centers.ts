import type { AreaKey } from "../../src/lib/types.ts";

export type AreaCenter = {
  label: string;
  x: number;
  y: number;
};

export const AREA_CENTERS: Record<AreaKey, AreaCenter[]> = {
  hongdae: [
    { label: "홍대입구역", x: 126.9237, y: 37.5572 },
    { label: "상상마당", x: 126.921, y: 37.5513 },
    { label: "상수역", x: 126.922, y: 37.5478 },
  ],
  hapjeong: [
    { label: "합정역", x: 126.914, y: 37.5495 },
    { label: "메세나폴리스", x: 126.9134, y: 37.5507 },
    { label: "양화진", x: 126.9112, y: 37.5459 },
  ],
  yeonnam: [
    { label: "연남동 중심", x: 126.9238, y: 37.5623 },
    { label: "경의선숲길 연남", x: 126.9256, y: 37.5608 },
    { label: "동진시장", x: 126.9268, y: 37.5652 },
  ],
  mangwon: [
    { label: "망원역", x: 126.9101, y: 37.5561 },
    { label: "망원시장", x: 126.9066, y: 37.5567 },
    { label: "망원한강공원", x: 126.8957, y: 37.5551 },
  ],
};

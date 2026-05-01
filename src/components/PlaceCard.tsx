import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { RecommendedPlace } from "@/lib/types";

type PlaceCardProps = {
  place: RecommendedPlace;
};

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#ffe3e8] bg-white shadow-[0_14px_34px_rgba(255,143,163,0.12)]">
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5f3b32] via-[#8f5a4d] to-[#ffd6e0]">
          <div className="absolute inset-x-3 top-4 h-8 rounded-full bg-white/20 blur-sm" />
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-black text-[#f06f88]">
            {CATEGORY_LABELS[place.category]}
          </div>
        </div>

        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-black leading-6 text-[#303038]">
              {place.name}
            </h3>
            <span className="shrink-0 rounded-full bg-[#fff3f6] px-2.5 py-1 text-xs font-black text-[#ff7f96]">
              {formatDistance(place.distanceMeters)}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-[#9a8f96]">
            {place.address}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#68616a]">
            {place.reason}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[#fff0f3] p-3 pt-0">
        <a
          href={place.placeUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-11 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff8fa3] to-[#ff758f] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(255,117,143,0.26)]"
        >
          지도 보기
        </a>
      </div>
    </article>
  );
}

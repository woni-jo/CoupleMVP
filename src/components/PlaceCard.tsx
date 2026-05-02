import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { RecommendedPlace } from "@/lib/types";

type PlaceCardProps = {
  place: RecommendedPlace;
};

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#ffe3e8] bg-white shadow-[0_14px_34px_rgba(255,143,163,0.12)]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black text-[#ff7f96]">
              {CATEGORY_LABELS[place.category]}
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-black leading-6 text-[#303038]">
              {place.name}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-[#fff3f6] px-2.5 py-1 text-xs font-black text-[#ff7f96]">
            {formatDistance(place.distanceMeters)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#8d858b]">
          {place.address}
        </p>
      </div>

      <div className="border-t border-[#fff0f3] p-3 pt-0">
        <a
          href={place.placeUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff8fa3] to-[#ff758f] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(255,117,143,0.26)]"
        >
          지도 보기
        </a>
      </div>
    </article>
  );
}

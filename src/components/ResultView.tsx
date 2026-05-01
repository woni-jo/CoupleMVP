"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AREAS } from "@/lib/constants";
import type { ActionKey, RecommendationResponse } from "@/lib/types";
import { ActionTabs } from "./ActionTabs";
import { PlaceCard } from "./PlaceCard";

type ResultViewProps = {
  recommendation: RecommendationResponse;
};

export function ResultView({ recommendation }: ResultViewProps) {
  const firstOption = recommendation.options[0];
  const [selectedKey, setSelectedKey] = useState<ActionKey>(
    firstOption?.key ?? "cafe",
  );

  const selectedOption =
    recommendation.options.find((option) => option.key === selectedKey) ??
    firstOption;

  const areaLabel =
    AREAS.find((area) => area.key === recommendation.meta.area)?.label ?? "홍대";

  const timeLabel = useMemo(
    () => formatKoreanTime(recommendation.meta.currentTime),
    [recommendation.meta.currentTime],
  );

  if (!selectedOption) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-[#fffafa]">
      <header className="bg-[#fff3f6] px-5 pb-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#ff7f96]">
              {areaLabel} · {timeLabel}
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-[#303038]">
              우리의 다음 선택지는?
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#8d858b]">
              마음에 드는 행동을 먼저 고르면 장소가 바뀌어요.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-10 shrink-0 items-center justify-center rounded-2xl border border-[#ffd6e0] bg-white px-3 text-sm font-black text-[#f06f88]"
          >
            다시
          </Link>
        </div>
      </header>

      <section className="px-5 pt-5">
        <ActionTabs
          options={recommendation.options}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
      </section>

      <section className="mx-5 mt-3 rounded-3xl border border-[#ffe3e8] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3f6] text-lg font-black text-[#ff8fa3]">
            ♥
          </span>
          <div>
            <p className="text-sm font-black text-[#303038]">
              {selectedOption.description}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#8d858b]">
              {selectedOption.reason}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {selectedOption.places.length > 0 ? (
          selectedOption.places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ffc9d4] bg-white p-5 text-center">
            <p className="text-base font-black text-[#303038]">
              아직 표시할 장소가 없어요
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8d858b]">
              Supabase places 데이터에 이 행동과 지역에 맞는 장소를 추가해 주세요.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function formatKoreanTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "현재 시간";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

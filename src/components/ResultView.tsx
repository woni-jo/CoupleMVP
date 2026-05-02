"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AREAS } from "@/lib/constants";
import type {
  ActionKey,
  RecommendRequest,
  RecommendationOption,
  RecommendationResponse,
} from "@/lib/types";
import { ActionTabs } from "./ActionTabs";
import { PlaceCard } from "./PlaceCard";

type ResultViewProps = {
  recommendation: RecommendationResponse;
  request: RecommendRequest;
};

export function ResultView({ recommendation, request }: ResultViewProps) {
  const [activeRecommendation, setActiveRecommendation] =
    useState(recommendation);
  const firstOption = activeRecommendation.options[0];
  const [selectedKey, setSelectedKey] = useState<ActionKey>(
    firstOption?.key ?? "cafe",
  );
  const [variant, setVariant] = useState(request.variant ?? 0);
  const [isChanging, setIsChanging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedOption =
    activeRecommendation.options.find((option) => option.key === selectedKey) ??
    firstOption;
  const usesCurrentLocation =
    activeRecommendation.meta.usesCurrentLocation ||
    (typeof request.lat === "number" && typeof request.lng === "number");

  const areaLabel =
    AREAS.find((area) => area.key === activeRecommendation.meta.area)?.label ??
    "선택 지역";

  const timeLabel = useMemo(
    () => formatKoreanTime(activeRecommendation.meta.currentTime),
    [activeRecommendation.meta.currentTime],
  );

  async function handleRefreshSelectedOption() {
    if (!selectedOption) {
      return;
    }

    const targetKey = selectedOption.key;
    const nextVariant = variant + 1;
    setIsChanging(true);
    setErrorMessage("");

    try {
      const nextRecommendation = await fetchRecommendation(nextVariant);
      const nextOption = nextRecommendation.options.find(
        (option) => option.key === targetKey,
      );

      if (!nextOption) {
        throw new Error(`Missing option for ${targetKey}`);
      }

      setActiveRecommendation((current) => ({
        meta: nextRecommendation.meta,
        options: replaceOption(current.options, nextOption),
      }));
      setSelectedKey(targetKey);
      setVariant(nextVariant);
    } catch (error) {
      console.error(error);
      setErrorMessage("선택한 추천을 다시 가져오지 못했어요.");
    } finally {
      setIsChanging(false);
    }
  }

  async function fetchRecommendation(nextVariant: number) {
    const params = new URLSearchParams({
      area: request.area ?? activeRecommendation.meta.area,
      currentTime: request.currentTime ?? activeRecommendation.meta.currentTime,
      variant: String(nextVariant),
    });

    if (request.intent) {
      params.set("intent", request.intent);
    }

    if (typeof request.lat === "number") {
      params.set("lat", String(request.lat));
    }

    if (typeof request.lng === "number") {
      params.set("lng", String(request.lng));
    }

    const response = await fetch(`/api/recommend?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Recommendation request failed: ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!isRecommendationResponse(data)) {
      throw new Error("Recommendation response shape is invalid.");
    }

    return data;
  }

  if (!selectedOption) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-[#fffafa]">
      <header className="bg-[#fff3f6] px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-[#ff7f96]">
                {areaLabel} · {timeLabel}
              </p>
              {usesCurrentLocation ? (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#f06f88] shadow-[0_6px_14px_rgba(255,143,163,0.16)]">
                  현재 위치 기준
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-black leading-tight text-[#303038]">
              우리의 다음 선택지는?
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#8d858b]">
              {usesCurrentLocation
                ? "선택한 지역 안에서 지금 위치와 가까운 곳을 먼저 보여줘요."
                : "선택한 지역 기준으로 가기 좋은 곳을 보여줘요."}
            </p>
          </div>
          <Link
            href="/?start=1"
            className="flex h-10 shrink-0 items-center justify-center rounded-2xl border border-[#ffd6e0] bg-white px-3 text-sm font-black text-[#f06f88]"
          >
            다시
          </Link>
        </div>
      </header>

      <section className="px-5 pt-5">
        <ActionTabs
          options={activeRecommendation.options}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
      </section>

      <section className="mx-5 mt-3 rounded-3xl border border-[#ffe3e8] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-[#303038]">
            {selectedOption.label} 추천
          </p>
          {isChanging ? (
            <span className="text-xs font-black text-[#ff7f96]">
              다시 고르는 중
            </span>
          ) : null}
        </div>
      </section>

      <section className="mt-4 space-y-3 px-5 pb-4">
        {selectedOption.places.length > 0 ? (
          selectedOption.places.map((place) => (
            <PlaceCard key={`${selectedOption.key}-${place.id}`} place={place} />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ffc9d4] bg-white p-5 text-center">
            <p className="text-base font-black text-[#303038]">
              아직 표시할 장소가 없어요
            </p>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 mt-auto bg-[#fffafa]/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {errorMessage ? (
          <p className="mb-2 text-center text-xs font-bold text-[#f06f88]">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleRefreshSelectedOption}
          disabled={isChanging}
          className="flex h-13 min-h-13 w-full items-center justify-center rounded-3xl border border-[#ffc9d4] bg-white px-5 text-base font-black text-[#f06f88] shadow-[0_12px_26px_rgba(255,143,163,0.16)] disabled:opacity-60"
        >
          {isChanging
            ? `${selectedOption.label} 다시 고르는 중`
            : `${selectedOption.label} 다시 추천`}
        </button>
      </div>
    </div>
  );
}

function replaceOption(
  options: RecommendationOption[],
  nextOption: RecommendationOption,
) {
  return options.map((option) =>
    option.key === nextOption.key ? nextOption : option,
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

function isRecommendationResponse(
  value: unknown,
): value is RecommendationResponse {
  if (
    !isRecord(value) ||
    !isRecord(value.meta) ||
    !Array.isArray(value.options)
  ) {
    return false;
  }

  return (
    typeof value.meta.area === "string" &&
    typeof value.meta.currentTime === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

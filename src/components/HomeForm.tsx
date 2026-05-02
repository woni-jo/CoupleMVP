"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AREAS, INTENTS } from "@/lib/constants";
import type { AreaKey, IntentKey } from "@/lib/types";

type UserLocation = {
  lat: number;
  lng: number;
};

const INTENT_MARKS: Record<IntentKey, string> = {
  lunch: "밥",
  cafe: "카",
  walk: "산",
  dinner: "저",
};

export function HomeForm() {
  const router = useRouter();
  const [area, setArea] = useState<AreaKey>("hongdae");
  const [intent, setIntent] = useState<IntentKey>("lunch");
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    "현재 위치 없이 선택한 동네 기준으로 추천해요.",
  );
  const [isLocating, setIsLocating] = useState(false);

  const areaLabel = useMemo(
    () => AREAS.find((item) => item.key === area)?.label ?? "선택 지역",
    [area],
  );
  const hasLocation = location !== null;

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("이 브라우저에서는 현재 위치를 사용할 수 없어요.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("현재 위치를 확인하는 중이에요.");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus(
          `${areaLabel} 안에서 현재 위치와 가까운 곳부터 추천해요.`,
        );
        setIsLocating(false);
      },
      () => {
        setLocation(null);
        setLocationStatus("위치 권한이 없어 선택한 동네 기준으로 추천해요.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
      },
    );
  }

  function handleAreaChange(nextArea: AreaKey) {
    setArea(nextArea);

    if (hasLocation) {
      const nextAreaLabel =
        AREAS.find((item) => item.key === nextArea)?.label ?? "선택 지역";
      setLocationStatus(
        `${nextAreaLabel} 안에서 현재 위치와 가까운 곳부터 추천해요.`,
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      area,
      intent,
      currentTime: new Date().toISOString(),
    });

    if (location) {
      params.set("lat", String(location.lat));
      params.set("lng", String(location.lng));
    }

    router.push(`/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-5 py-5">
      <section className="rounded-3xl border border-[#ffe3e8] bg-white p-4 shadow-[0_12px_30px_rgba(255,143,163,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-[#ff7f96]">지역 선택</p>
              {hasLocation ? (
                <span className="rounded-full bg-[#ff8fa3] px-2.5 py-1 text-xs font-black text-white">
                  현재 위치 기준 ON
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-[#777178]">
              지역은 후보 범위, 현재 위치는 거리 계산 기준이에요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className={`min-h-11 shrink-0 rounded-2xl border px-3 text-sm font-black disabled:opacity-60 ${
              hasLocation
                ? "border-[#ff8fa3] bg-[#ff8fa3] text-white shadow-[0_10px_20px_rgba(255,143,163,0.28)]"
                : "border-[#ffc9d4] bg-[#fff3f6] text-[#f06f88]"
            }`}
          >
            {isLocating
              ? "확인 중"
              : hasLocation
                ? "위치 적용됨"
                : "현위치"}
          </button>
        </div>
        <p
          className={`mt-3 rounded-2xl px-3 py-2 text-xs font-bold ${
            hasLocation
              ? "bg-[#fff3f6] text-[#f06f88]"
              : "bg-[#fafafa] text-[#9a8f96]"
          }`}
        >
          {locationStatus}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {AREAS.map((item) => {
            const isSelected = area === item.key;

            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleAreaChange(item.key)}
                className={`min-h-12 rounded-2xl border text-sm font-black transition ${
                  isSelected
                    ? "border-[#ff8fa3] bg-[#ff8fa3] text-white shadow-[0_10px_20px_rgba(255,143,163,0.32)]"
                    : "border-[#ffd6e0] bg-[#fffafa] text-[#f06f88]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <label htmlFor="area" className="sr-only">
          지역 수동 선택
        </label>
        <select
          id="area"
          value={area}
          onChange={(event) => handleAreaChange(event.target.value as AreaKey)}
          className="mt-3 h-12 w-full rounded-2xl border border-[#ffd6e0] bg-[#fafafa] px-4 text-base font-bold text-[#303038] outline-none focus:border-[#ff8fa3]"
        >
          {AREAS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-[#ff7f96]">상황 선택</p>
            <h2 className="mt-1 text-xl font-black text-[#303038]">
              지금 원하는 분위기는?
            </h2>
          </div>
          <span className="rounded-full bg-[#fff3f6] px-3 py-1 text-xs font-black text-[#ff7f96]">
            선택지 3개 추천
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {INTENTS.map((item) => {
            const isSelected = intent === item.key;

            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setIntent(item.key)}
                className={`flex min-h-20 items-center gap-4 rounded-3xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#ff8fa3] bg-[#fff3f6] shadow-[0_14px_34px_rgba(255,143,163,0.2)]"
                    : "border-[#ffe3e8] bg-white"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                    isSelected
                      ? "bg-[#ff8fa3] text-white"
                      : "bg-[#fff3f6] text-[#ff8fa3]"
                  }`}
                >
                  {INTENT_MARKS[item.key]}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black text-[#303038]">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-[#8d858b]">
                    {item.helper}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-auto pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-6">
        <button
          type="submit"
          className="flex h-15 min-h-15 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#ff8fa3] to-[#ff758f] px-5 text-lg font-black text-white shadow-[0_18px_34px_rgba(255,117,143,0.34)] transition active:scale-[0.99]"
        >
          추천받기
        </button>
      </div>
    </form>
  );
}

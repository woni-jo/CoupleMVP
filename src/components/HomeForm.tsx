"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { AREAS, INTENTS } from "@/lib/constants";
import type { AreaKey, IntentKey } from "@/lib/types";

type UserLocation = {
  lat: number;
  lng: number;
};

const INTENT_ICONS: Record<IntentKey, string> = {
  lunch: "🍴",
  cafe: "☕",
  walk: "↟",
  dinner: "♥",
};

export function HomeForm() {
  const router = useRouter();
  const [area, setArea] = useState<AreaKey>("hongdae");
  const [intent, setIntent] = useState<IntentKey>("lunch");
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("현재 위치는 선택 사항이에요.");
  const [isLocating, setIsLocating] = useState(false);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("이 브라우저에서는 위치 사용이 어려워요.");
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
        setLocationStatus("현재 위치를 추천에 반영할게요.");
        setIsLocating(false);
      },
      () => {
        setLocationStatus("위치 없이 선택한 지역 기준으로 추천할게요.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
      },
    );
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
            <p className="text-sm font-black text-[#ff7f96]">지역 선택</p>
            <p className="mt-1 text-sm leading-6 text-[#777178]">
              지금 있는 동네를 고르면 더 빠르게 추천해요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="min-h-11 shrink-0 rounded-2xl border border-[#ffc9d4] bg-[#fff3f6] px-3 text-sm font-black text-[#f06f88] disabled:opacity-60"
          >
            {isLocating ? "확인 중" : "현위치"}
          </button>
        </div>
        <p className="mt-3 text-xs font-semibold text-[#9a8f96]">
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
                onClick={() => setArea(item.key)}
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
          onChange={(event) => setArea(event.target.value as AreaKey)}
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
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black ${
                    isSelected
                      ? "bg-[#ff8fa3] text-white"
                      : "bg-[#fff3f6] text-[#ff8fa3]"
                  }`}
                >
                  {INTENT_ICONS[item.key]}
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

      <div className="mt-auto pt-6 pb-[max(1.1rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          className="flex h-15 min-h-15 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#ff8fa3] to-[#ff758f] px-5 text-lg font-black text-white shadow-[0_18px_34px_rgba(255,117,143,0.34)] transition active:scale-[0.99]"
        >
          추천받기 ♥
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { HomeForm } from "./HomeForm";

type HomeFlowProps = {
  initialStarted?: boolean;
};

export function HomeFlow({ initialStarted = false }: HomeFlowProps) {
  const [isStarted, setIsStarted] = useState(initialStarted);

  if (isStarted) {
    return (
      <>
        <HeroHeader />
        <HomeForm />
      </>
    );
  }

  return (
    <section className="flex flex-1 flex-col bg-[#fffafa] px-5 py-5">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[28px] bg-[#fff3f6] px-5 pb-6 pt-6">
        <div className="absolute -right-10 top-6 h-36 w-36 rounded-full bg-[#ffd6e0] blur-2xl" />
        <div className="absolute right-7 top-8 flex h-16 w-16 rotate-6 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ff8fa3] to-[#ffd6e0] text-2xl font-black text-white shadow-lg">
          ♥
        </div>

        <div className="relative">
          <p className="text-sm font-black text-[#ff7f96]">CoupleDating</p>
          <h1 className="mt-5 text-[2.35rem] font-black leading-tight tracking-normal text-[#303038]">
            데이트 중
            <br />
            다음 선택을
            <br />
            빠르게
          </h1>
          <p className="mt-4 max-w-[16rem] text-base leading-7 text-[#777178]">
            지금 있는 동네에서 밥, 카페, 산책 중 어디로 갈지 바로 골라요.
          </p>
        </div>

        <div className="relative mt-auto space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {["직관적", "빠른 결정", "데이트 흐름"].map((label) => (
              <span
                key={label}
                className="rounded-2xl border border-[#ffc9d4] bg-white/80 px-3 py-3 text-center text-xs font-black text-[#f06f88]"
              >
                {label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsStarted(true)}
            className="flex h-15 min-h-15 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#ff8fa3] to-[#ff758f] px-5 text-lg font-black text-white shadow-[0_18px_34px_rgba(255,117,143,0.34)] transition active:scale-[0.99]"
          >
            시작하기
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroHeader() {
  return (
    <header className="relative overflow-hidden bg-[#fff3f6] px-5 pb-6 pt-5">
      <div className="absolute -right-8 top-3 h-28 w-28 rounded-full bg-[#ffd6e0] blur-2xl" />
      <div className="absolute right-6 top-8 flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8fa3] to-[#ffd6e0] text-xl font-black text-white shadow-lg">
        ♥
      </div>
      <div className="relative">
        <p className="text-sm font-bold text-[#ff7f96]">CoupleDating</p>
        <h1 className="mt-3 text-[2rem] font-black leading-tight tracking-normal text-[#303038]">
          다음에 뭘 할지
          <br />
          먼저 골라볼까요?
        </h1>
        <p className="mt-3 max-w-[17rem] text-base leading-7 text-[#777178]">
          복잡한 고민은 줄이고, 둘이 함께하는 시간을 더 즐겁게.
        </p>
      </div>
    </header>
  );
}

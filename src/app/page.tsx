import { HomeForm } from "@/components/HomeForm";
import { MobileShell } from "@/components/MobileShell";

export default function Home() {
  return (
    <MobileShell>
      <header className="relative overflow-hidden bg-[#fff3f6] px-5 pb-6 pt-5">
        <div className="absolute -right-8 top-3 h-28 w-28 rounded-full bg-[#ffd6e0] blur-2xl" />
        <div className="absolute right-6 top-8 flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8fa3] to-[#ffd6e0] text-2xl font-black text-white shadow-lg">
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
      <HomeForm />
    </MobileShell>
  );
}

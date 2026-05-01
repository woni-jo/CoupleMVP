import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { ResultView } from "@/components/ResultView";
import { getRecommendation } from "@/lib/recommend";
import type { AreaKey, IntentKey, RecommendRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const request = parseRecommendRequest(params);
  const recommendation = await getRecommendation(request).catch((error) => {
    console.error(error);

    return null;
  });

  return (
    <MobileShell>
      {recommendation ? (
        <ResultView recommendation={recommendation} />
      ) : (
        <RecommendationError />
      )}
    </MobileShell>
  );
}

function RecommendationError() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5 bg-[#fffafa] px-5">
      <div>
        <p className="text-sm font-black text-[#ff7f96]">
          Supabase 연결이 필요해요
        </p>
        <h1 className="mt-2 text-2xl font-black leading-tight text-[#303038]">
          추천 데이터를 가져오지 못했습니다
        </h1>
        <p className="mt-3 text-base leading-7 text-[#777178]">
          `.env.local`에 Supabase URL과 anon key를 넣고, places 테이블에
          데이터를 import하면 결과가 표시됩니다.
        </p>
      </div>
      <Link
        href="/"
        className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff8fa3] to-[#ff758f] px-4 text-base font-black text-white"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

function parseRecommendRequest(
  params: Record<string, string | string[] | undefined>,
): RecommendRequest {
  const area = parseArea(getParam(params.area));
  const intent = parseIntent(getParam(params.intent));
  const lat = parseNumber(getParam(params.lat));
  const lng = parseNumber(getParam(params.lng));

  return {
    area,
    intent,
    lat,
    lng,
    currentTime: getParam(params.currentTime) ?? new Date().toISOString(),
  };
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseArea(value?: string): AreaKey | undefined {
  if (
    value === "hongdae" ||
    value === "hapjeong" ||
    value === "yeonnam" ||
    value === "mangwon"
  ) {
    return value;
  }

  return undefined;
}

function parseIntent(value?: string): IntentKey | undefined {
  if (
    value === "lunch" ||
    value === "cafe" ||
    value === "walk" ||
    value === "dinner"
  ) {
    return value;
  }

  return undefined;
}

function parseNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

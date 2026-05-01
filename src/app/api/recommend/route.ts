import { getRecommendation } from "@/lib/recommend";
import type { AreaKey, IntentKey, RecommendRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return createRecommendationResponse({
    area: parseArea(searchParams.get("area") ?? undefined),
    intent: parseIntent(searchParams.get("intent") ?? undefined),
    lat: parseNumber(searchParams.get("lat") ?? undefined),
    lng: parseNumber(searchParams.get("lng") ?? undefined),
    currentTime: searchParams.get("currentTime") ?? new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => ({}));

  return createRecommendationResponse(parseBody(body));
}

async function createRecommendationResponse(request: RecommendRequest) {
  try {
    const recommendation = await getRecommendation(request);

    return Response.json(recommendation);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "RECOMMENDATION_FAILED",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

function parseBody(body: unknown): RecommendRequest {
  if (!isRecord(body)) {
    return {};
  }

  return {
    area: parseArea(readString(body.area)),
    intent: parseIntent(readString(body.intent)),
    lat: readNumber(body.lat),
    lng: readNumber(body.lng),
    currentTime: readString(body.currentTime),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    return parseNumber(value);
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

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "추천을 가져오지 못했습니다.";
}

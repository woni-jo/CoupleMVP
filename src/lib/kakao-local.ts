const KAKAO_CATEGORY_SEARCH_URL =
  "https://dapi.kakao.com/v2/local/search/category.json";

export type KakaoCategorySearchParams = {
  categoryGroupCode: string;
  x: number;
  y: number;
  radius: number;
  page: number;
  size: number;
  sort: "distance" | "accuracy";
};

export type KakaoPlaceDocument = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
};

export type KakaoCategorySearchResponse = {
  documents: KakaoPlaceDocument[];
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
    same_name?: {
      keyword: string;
      region: string[];
      selected_region: string;
    };
  };
};

type KakaoCategorySearchOptions = {
  apiKey: string;
  retryCount?: number;
  retryDelayMs?: number;
};

export async function searchKakaoPlacesByCategory(
  params: KakaoCategorySearchParams,
  options: KakaoCategorySearchOptions,
): Promise<KakaoCategorySearchResponse> {
  const retryCount = options.retryCount ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 700;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(buildCategorySearchUrl(params), {
        headers: {
          Authorization: `KakaoAK ${options.apiKey}`,
        },
      });

      if (response.ok) {
        return (await response.json()) as KakaoCategorySearchResponse;
      }

      const message = await response.text();
      lastError = new Error(
        `Kakao Local API failed: ${response.status} ${response.statusText} ${message}`,
      );

      if (!shouldRetry(response.status) || attempt === retryCount) {
        throw lastError;
      }
    } catch (error) {
      lastError = toError(error);

      if (attempt === retryCount) {
        throw lastError;
      }
    }

    await delay(retryDelayMs * (attempt + 1));
  }

  throw lastError ?? new Error("Kakao Local API request failed.");
}

function buildCategorySearchUrl(params: KakaoCategorySearchParams) {
  const url = new URL(KAKAO_CATEGORY_SEARCH_URL);
  url.searchParams.set("category_group_code", params.categoryGroupCode);
  url.searchParams.set("x", String(params.x));
  url.searchParams.set("y", String(params.y));
  url.searchParams.set("radius", String(params.radius));
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("size", String(params.size));
  url.searchParams.set("sort", params.sort);

  return url;
}

function shouldRetry(status: number) {
  return status === 429 || status >= 500;
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

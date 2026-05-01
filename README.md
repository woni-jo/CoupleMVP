# CoupleDating

홍대, 합정, 연남, 망원에서 데이트 중인 커플이 "지금 다음에 뭘 할지" 빠르게 고르는 모바일 우선 MVP입니다.

앱 런타임 추천은 Supabase `public.places`만 조회합니다. 카카오 Local API는 초기 장소 데이터 수집용 CLI에서만 호출합니다.

## 실행

```bash
cd coupledating
cmd /c npm install
cmd /c npm run dev
```

검증:

```bash
cmd /c npm run lint
cmd /c npm run test
cmd /c npm run build
```

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만듭니다.

```bash
copy .env.example .env.local
```

필수:

```env
KAKAO_REST_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

선택:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

주의: `SUPABASE_SERVICE_ROLE_KEY`는 CLI 적재 스크립트에서만 사용합니다. 브라우저나 `NEXT_PUBLIC_*` 환경변수로 노출하지 마세요.

## Kakao Developers 설정

1. Kakao Developers에서 애플리케이션을 생성합니다.
2. 내 애플리케이션 > 앱 설정 > 요약 정보에서 `REST API 키`를 복사합니다.
3. `.env.local`의 `KAKAO_REST_API_KEY`에 넣습니다.
4. 제품 설정에서 카카오맵 사용 설정을 ON으로 둡니다.
5. 이 프로젝트는 카카오 Local API의 category search endpoint만 CLI에서 호출합니다.

사용 endpoint:

```text
GET https://dapi.kakao.com/v2/local/search/category.json
Authorization: KakaoAK ${KAKAO_REST_API_KEY}
```

수집 category:

```text
FD6 -> restaurant
CE7 -> cafe
CT1 -> culture
AT4 -> attraction
```

## Supabase 설정

1. Supabase SQL Editor에서 `supabase/places.sql`을 실행합니다.
2. 기존 테이블이 이미 있고 `attraction` category만 추가하면 `supabase/migrations/20260430_allow_attraction_category.sql`을 실행합니다.
3. RLS는 anon read policy만 열려 있습니다. 앱 추천 API는 anon key로 `is_active = true` 데이터만 읽습니다.
4. CLI import는 `SUPABASE_SERVICE_ROLE_KEY`로 upsert합니다.

기존 sample CSV를 직접 넣고 싶다면 Table Editor에서 `supabase/sample_places.csv`를 import할 수 있습니다.

## 장소 수집

카카오 API에서 여러 중심점과 category를 순회해 raw JSON, normalized JSON, import용 CSV를 만듭니다.

```bash
cmd /c npm run places:fetch
```

옵션 예시:

```bash
cmd /c npm run places:fetch -- --area=hongdae,mangwon --category=FD6,CE7 --radius=900 --page-limit=2
```

기본값:

- radius: `900`
- page limit: `3`
- size: `15`
- sort: `distance`
- area: `hongdae`, `hapjeong`, `yeonnam`, `mangwon`
- category: `FD6`, `CE7`, `CT1`, `AT4`

산출물:

```text
data/kakao_places_raw.json
data/kakao_places_normalized.json
data/kakao_places_normalized.csv
```

중복 제거:

- 1차: `external_id`
- 2차: `name + lat + lng`

## Supabase 적재

수집된 normalized JSON을 `public.places`에 `external_id` 기준으로 upsert합니다.

```bash
cmd /c npm run places:import
```

dry-run:

```bash
cmd /c npm run places:import -- --dry-run
```

파일 지정:

```bash
cmd /c npm run places:import -- --file=data/kakao_places_normalized.json
```

수집 후 바로 적재:

```bash
cmd /c npm run places:sync
```

## 추천 API

앱 런타임에서는 카카오 API를 호출하지 않습니다. 추천 API는 Supabase `public.places`만 조회합니다.

GET:

```bash
curl "http://127.0.0.1:3000/api/recommend?area=hongdae&intent=lunch&lat=37.555&lng=126.923"
```

POST:

```bash
curl -X POST "http://127.0.0.1:3000/api/recommend" ^
  -H "Content-Type: application/json" ^
  -d "{\"area\":\"hongdae\",\"intent\":\"lunch\",\"lat\":37.555,\"lng\":126.923,\"currentTime\":\"2026-04-30T12:30:00+09:00\"}"
```

추천 규칙:

- 시간대 + intent 기준으로 행동 선택지 3개 생성
- 행동별 category 또는 `time_slots` 기준으로 장소 후보 필터링
- 선택 지역에 가산점 적용
- lat/lng가 있으면 haversine 거리 계산
- `manual_score + 지역 가산점 - 거리 패널티`로 정렬
- 상위 후보군 안에서만 랜덤 적용

## 주요 구조

```text
src/
  app/api/recommend/route.ts
  app/results/page.tsx
  components/
  lib/
    kakao-local.ts
    place-normalize.ts
    recommend.ts
    supabase.ts
scripts/
  config/
    area-centers.ts
    categories.ts
  fetch-kakao-places.ts
  import-places-to-supabase.ts
supabase/
  places.sql
  sample_places.csv
  migrations/20260430_allow_attraction_category.sql
data/
  kakao_places_raw.json
  kakao_places_normalized.json
  kakao_places_normalized.csv
```

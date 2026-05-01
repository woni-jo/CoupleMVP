#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AREA_CENTERS } from "./config/area-centers.ts";
import {
  KAKAO_CATEGORY_MAPPINGS,
  type KakaoCategoryMapping,
} from "./config/categories.ts";
import { loadLocalEnv } from "./config/load-env.ts";
import {
  delay,
  type KakaoCategorySearchResponse,
  type KakaoPlaceDocument,
  searchKakaoPlacesByCategory,
} from "../src/lib/kakao-local.ts";
import {
  dedupeNormalizedPlaces,
  normalizeKakaoPlace,
  type NormalizedPlaceRecord,
} from "../src/lib/place-normalize.ts";
import type { AreaKey } from "../src/lib/types.ts";

const DEFAULT_RADIUS_METERS = 900;
const DEFAULT_PAGE_LIMIT = 3;
const DEFAULT_SIZE = 15;
const DEFAULT_DELAY_MS = 150;
const DATA_DIR = "data";

type RawCollectionBatch = {
  area: AreaKey;
  centerLabel: string;
  x: number;
  y: number;
  categoryCode: KakaoCategoryMapping["code"];
  category: KakaoCategoryMapping["category"];
  page: number;
  documents: KakaoPlaceDocument[];
  meta: KakaoCategorySearchResponse["meta"];
};

type FetchOptions = {
  radius: number;
  pageLimit: number;
  size: number;
  delayMs: number;
  areas: AreaKey[];
  categoryCodes: KakaoCategoryMapping["code"][];
};

const CSV_COLUMNS: Array<keyof NormalizedPlaceRecord> = [
  "external_id",
  "name",
  "area",
  "category",
  "address",
  "lat",
  "lng",
  "manual_score",
  "tags",
  "time_slots",
  "place_url",
  "is_active",
];

async function main() {
  loadLocalEnv();

  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    printHelp();
    return;
  }

  const apiKey = readRequiredEnv("KAKAO_REST_API_KEY");
  const options = parseOptions(args);
  const rawBatches: RawCollectionBatch[] = [];
  const normalizedCandidates: NormalizedPlaceRecord[] = [];

  for (const area of options.areas) {
    const centers = AREA_CENTERS[area];

    for (const center of centers) {
      for (const mapping of getSelectedMappings(options.categoryCodes)) {
        let page = 1;

        while (page <= options.pageLimit) {
          console.log(
            `[fetch] area=${area} center=${center.label} category=${mapping.code} page=${page}`,
          );

          const response = await searchKakaoPlacesByCategory(
            {
              categoryGroupCode: mapping.code,
              x: center.x,
              y: center.y,
              radius: options.radius,
              page,
              size: options.size,
              sort: "distance",
            },
            { apiKey },
          );

          rawBatches.push({
            area,
            centerLabel: center.label,
            x: center.x,
            y: center.y,
            categoryCode: mapping.code,
            category: mapping.category,
            page,
            documents: response.documents,
            meta: response.meta,
          });

          for (const document of response.documents) {
            const normalized = normalizeKakaoPlace({
              document,
              area,
              mapping,
            });

            if (normalized) {
              normalizedCandidates.push(normalized);
            }
          }

          if (response.meta.is_end) {
            break;
          }

          page += 1;
          await delay(options.delayMs);
        }

        await delay(options.delayMs);
      }
    }
  }

  const normalizedPlaces = dedupeNormalizedPlaces(normalizedCandidates);
  await writeOutputs(rawBatches, normalizedPlaces);

  console.log(
    `[done] raw batches=${rawBatches.length}, normalized=${normalizedCandidates.length}, deduped=${normalizedPlaces.length}`,
  );
}

function parseOptions(args: string[]): FetchOptions {
  return {
    radius: readNumberOption(args, "radius", DEFAULT_RADIUS_METERS),
    pageLimit: readNumberOption(args, "page-limit", DEFAULT_PAGE_LIMIT),
    size: readNumberOption(args, "size", DEFAULT_SIZE),
    delayMs: readNumberOption(args, "delay-ms", DEFAULT_DELAY_MS),
    areas: readAreaOption(args),
    categoryCodes: readCategoryOption(args),
  };
}

function readNumberOption(args: string[], key: string, fallback: number) {
  const value = readOption(args, key);

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`--${key} must be a positive number.`);
  }

  return parsed;
}

function readAreaOption(args: string[]) {
  const value = readOption(args, "area");

  if (!value) {
    return Object.keys(AREA_CENTERS) as AreaKey[];
  }

  const areas = value.split(",").map((item) => item.trim());
  const validAreas: AreaKey[] = [];

  for (const area of areas) {
    if (!isArea(area)) {
      throw new Error(`Unknown area: ${area}`);
    }

    validAreas.push(area);
  }

  return validAreas;
}

function readCategoryOption(args: string[]) {
  const value = readOption(args, "category");

  if (!value) {
    return KAKAO_CATEGORY_MAPPINGS.map((mapping) => mapping.code);
  }

  const codes = value.split(",").map((item) => item.trim());
  const validCodes: Array<KakaoCategoryMapping["code"]> = [];

  for (const code of codes) {
    if (!isKakaoCategoryCode(code)) {
      throw new Error(`Unknown Kakao category code: ${code}`);
    }

    validCodes.push(code);
  }

  return validCodes;
}

function readOption(args: string[], key: string) {
  const prefix = `--${key}=`;
  const option = args.find((arg) => arg.startsWith(prefix));

  return option?.slice(prefix.length);
}

function getSelectedMappings(codes: KakaoCategoryMapping["code"][]) {
  const selected = new Set(codes);

  return KAKAO_CATEGORY_MAPPINGS.filter((mapping) => selected.has(mapping.code));
}

async function writeOutputs(
  rawBatches: RawCollectionBatch[],
  normalizedPlaces: NormalizedPlaceRecord[],
) {
  await mkdir(DATA_DIR, { recursive: true });

  await Promise.all([
    writeFile(
      join(DATA_DIR, "kakao_places_raw.json"),
      `${JSON.stringify(rawBatches, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      join(DATA_DIR, "kakao_places_normalized.json"),
      `${JSON.stringify(normalizedPlaces, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      join(DATA_DIR, "kakao_places_normalized.csv"),
      serializeCsv(normalizedPlaces),
      "utf8",
    ),
  ]);
}

function serializeCsv(records: NormalizedPlaceRecord[]) {
  const rows = [
    CSV_COLUMNS.join(","),
    ...records.map((record) =>
      CSV_COLUMNS.map((column) => formatCsvValue(record[column])).join(","),
    ),
  ];

  return `${rows.join("\n")}\n`;
}

function formatCsvValue(value: NormalizedPlaceRecord[keyof NormalizedPlaceRecord]) {
  if (Array.isArray(value)) {
    return escapeCsv(toPostgresArray(value));
  }

  return escapeCsv(String(value));
}

function toPostgresArray(values: string[]) {
  return `{${values.join(",")}}`;
}

function escapeCsv(value: string) {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local or your shell env.`);
  }

  return value;
}

function isArea(value: string): value is AreaKey {
  return (
    value === "hongdae" ||
    value === "hapjeong" ||
    value === "yeonnam" ||
    value === "mangwon"
  );
}

function isKakaoCategoryCode(
  value: string,
): value is KakaoCategoryMapping["code"] {
  return value === "FD6" || value === "CE7" || value === "CT1" || value === "AT4";
}

function printHelp() {
  console.log(`Kakao places fetcher

Required env:
  KAKAO_REST_API_KEY

Options:
  --radius=900             Search radius in meters
  --page-limit=3           Max pages per center/category
  --size=15                Kakao page size
  --delay-ms=150           Delay between calls
  --area=hongdae,mangwon   Optional area filter
  --category=FD6,CE7       Optional Kakao category filter

Outputs:
  data/kakao_places_raw.json
  data/kakao_places_normalized.json
  data/kakao_places_normalized.csv`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

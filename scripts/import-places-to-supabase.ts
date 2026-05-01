#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { loadLocalEnv } from "./config/load-env.ts";
import type { Database } from "../src/lib/supabase.ts";
import type { NormalizedPlaceRecord } from "../src/lib/place-normalize.ts";

const DEFAULT_INPUT_FILE = "data/kakao_places_normalized.json";
const DEFAULT_BATCH_SIZE = 100;

type ImportOptions = {
  inputFile: string;
  batchSize: number;
  dryRun: boolean;
};

async function main() {
  loadLocalEnv();

  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    printHelp();
    return;
  }

  const options = parseOptions(args);
  const records = await readNormalizedPlaces(options.inputFile);

  if (options.dryRun) {
    console.log(`[dry-run] valid records=${records.length}`);
    console.log("[dry-run] Supabase upsert skipped.");
    return;
  }

  const supabaseUrl = readRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const externalIds = records.map((record) => record.external_id);
  const existingIds = await fetchExistingExternalIds(supabase, externalIds);
  const insertCount = records.filter(
    (record) => !existingIds.has(record.external_id),
  ).length;
  const updateCount = records.length - insertCount;

  for (const batch of chunk(records, options.batchSize)) {
    const { error } = await supabase.from("places").upsert(batch, {
      onConflict: "external_id",
    });

    if (error) {
      throw new Error(`Supabase upsert failed: ${error.message}`);
    }
  }

  console.log(
    `[done] upserted=${records.length}, inserts=${insertCount}, updates=${updateCount}`,
  );
}

function parseOptions(args: string[]): ImportOptions {
  return {
    inputFile: readOption(args, "file") ?? DEFAULT_INPUT_FILE,
    batchSize: readNumberOption(args, "batch-size", DEFAULT_BATCH_SIZE),
    dryRun: args.includes("--dry-run"),
  };
}

async function readNormalizedPlaces(inputFile: string) {
  const raw = await readFile(inputFile, "utf8").catch((error: unknown) => {
    throw new Error(
      `Failed to read ${inputFile}. Run places:fetch first. ${getMessage(error)}`,
    );
  });
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${inputFile} must contain a JSON array.`);
  }

  const records = parsed.filter(isNormalizedPlaceRecord);

  if (records.length !== parsed.length) {
    throw new Error(
      `${inputFile} contains invalid records. Check normalized output format.`,
    );
  }

  return records;
}

async function fetchExistingExternalIds(
  supabase: ReturnType<typeof createClient<Database>>,
  externalIds: string[],
) {
  const existingIds = new Set<string>();

  for (const batch of chunk(externalIds, 500)) {
    const { data, error } = await supabase
      .from("places")
      .select("external_id")
      .in("external_id", batch);

    if (error) {
      throw new Error(`Failed to check existing places: ${error.message}`);
    }

    for (const row of data ?? []) {
      if (row.external_id) {
        existingIds.add(row.external_id);
      }
    }
  }

  return existingIds;
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

function readOption(args: string[], key: string) {
  const prefix = `--${key}=`;
  const option = args.find((arg) => arg.startsWith(prefix));

  return option?.slice(prefix.length);
}

function isNormalizedPlaceRecord(value: unknown): value is NormalizedPlaceRecord {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.external_id === "string" &&
    typeof value.name === "string" &&
    typeof value.area === "string" &&
    typeof value.category === "string" &&
    typeof value.address === "string" &&
    typeof value.lat === "number" &&
    typeof value.lng === "number" &&
    typeof value.manual_score === "number" &&
    Array.isArray(value.tags) &&
    Array.isArray(value.time_slots) &&
    typeof value.place_url === "string" &&
    typeof value.is_active === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local or your shell env.`);
  }

  return value;
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function printHelp() {
  console.log(`Supabase places importer

Required env:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Options:
  --file=data/kakao_places_normalized.json
  --batch-size=100
  --dry-run

Upsert target:
  public.places on conflict external_id`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

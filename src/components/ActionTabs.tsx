"use client";

import type { ActionKey, RecommendationOption } from "@/lib/types";

type ActionTabsProps = {
  options: RecommendationOption[];
  selectedKey: ActionKey;
  onSelect: (key: ActionKey) => void;
};

export function ActionTabs({
  options,
  selectedKey,
  onSelect,
}: ActionTabsProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2">
      <div className="flex w-max gap-2">
        {options.map((option) => {
          const isSelected = selectedKey === option.key;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option.key)}
              className={`min-h-12 min-w-24 rounded-2xl border px-4 text-base font-black transition ${
                isSelected
                  ? "border-[#ff8fa3] bg-[#ff8fa3] text-white shadow-[0_12px_24px_rgba(255,143,163,0.32)]"
                  : "border-[#ffd6e0] bg-white text-[#f06f88]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inputClasses, selectClasses } from "@/components/ui/formClasses";

export type SearchableSelectOption = {
  value: string;
  label: string;
  group: string;
  /** Extra text to match against when searching, e.g. an id not shown in the label. */
  searchText?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  emptyLabel = "None",
  placeholder = "Search...",
  disabled = false,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  emptyLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.searchText ?? ""}`.toLowerCase().includes(q));
  }, [options, query]);

  const grouped = useMemo(() => {
    const groups: { group: string; items: SearchableSelectOption[] }[] = [];
    for (const opt of filtered) {
      const existing = groups.find((g) => g.group === opt.group);
      if (existing) existing.items.push(opt);
      else groups.push({ group: opt.group, items: [opt] });
    }
    return groups;
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function selectOption(optValue: string) {
    onChange(optValue);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) selectOption(opt.value);
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`${selectClasses} flex w-full items-center justify-between text-left disabled:opacity-50`}
      >
        <span className={`min-w-0 truncate ${selected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-500"}`}>
          {selected ? selected.label : emptyLabel}
        </span>
        <span className="ml-2 shrink-0 text-zinc-400">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 p-1.5 dark:border-zinc-800">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`${inputClasses} p-1.5 font-sans text-zinc-900 dark:text-zinc-100`}
            />
          </div>
          <div role="listbox" className="max-h-64 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => selectOption("")}
              className={`block w-full rounded px-2 py-1 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 ${
                value === "" ? "font-medium" : ""
              }`}
            >
              {emptyLabel}
            </button>
            {filtered.length === 0 && <div className="px-2 py-1.5 text-sm text-zinc-500 dark:text-zinc-500">No matches</div>}
            {grouped.map(({ group, items }) => (
              <div key={group} className="mt-1 first:mt-0">
                <div className="px-2 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-600">{group}</div>
                {items.map((opt) => {
                  const globalIndex = filtered.indexOf(opt);
                  const isActive = globalIndex === activeIndex;
                  return (
                    <button
                      key={opt.value}
                      ref={isActive ? activeItemRef : undefined}
                      type="button"
                      onClick={() => selectOption(opt.value)}
                      className={`block w-full truncate rounded px-2 py-1 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 ${
                        opt.value === value ? "bg-zinc-100 font-medium dark:bg-zinc-800" : ""
                      } ${isActive ? "ring-1 ring-inset ring-zinc-400 dark:ring-zinc-500" : ""}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

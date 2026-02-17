"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Technology = { id: bigint; name: string };

export default function TechnologyPicker({
    technologies,
    defaultSelected = [],
}: {
    technologies: Technology[];
    defaultSelected?: string[];
}) {
    const [selected, setSelected] = useState<string[]>(defaultSelected);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const available = technologies.filter(
        (t) =>
            !selected.includes(t.name) &&
            t.name.toLowerCase().includes(query.toLowerCase()),
    );

    const add = useCallback((name: string) => {
        setSelected((prev) => [...prev, name]);
        setQuery("");
        setActiveIndex(-1);
        inputRef.current?.focus();
    }, []);

    const remove = useCallback((name: string) => {
        setSelected((prev) => prev.filter((n) => n !== name));
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Backspace" && query === "" && selected.length > 0) {
                remove(selected[selected.length - 1]);
                return;
            }
            if (e.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
                return;
            }
            if (!open || available.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => (i + 1) % available.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => (i <= 0 ? available.length - 1 : i - 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < available.length) {
                    add(available[activeIndex].name);
                }
            }
        },
        [query, selected, open, available, activeIndex, add, remove],
    );

    // Scroll active option into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    // Close dropdown when clicking outside
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setActiveIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const activeId = activeIndex >= 0 ? `tech-option-${activeIndex}` : undefined;

    return (
        <div ref={containerRef} className="relative">
            {/* Hidden inputs for form submission */}
            {selected.map((name) => (
                <input key={name} type="hidden" name="technologies" value={name} />
            ))}

            {/* Selected pills + input */}
            <div
                className="flex flex-wrap gap-1.5 w-full border border-border bg-transparent rounded-md px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {selected.map((name) => (
                    <span
                        key={name}
                        className="inline-flex items-center gap-1 bg-surface text-muted px-2 py-0.5 rounded text-xs font-medium"
                    >
                        {name}
                        <button
                            type="button"
                            onClick={() => remove(name)}
                            className="cursor-pointer hover:text-foreground"
                            aria-label={`Remove ${name}`}
                        >
                            &times;
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length === 0 ? "Search technologies..." : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-0.5 placeholder:text-muted/50"
                    role="combobox"
                    aria-expanded={open && available.length > 0}
                    aria-controls="tech-listbox"
                    aria-activedescendant={activeId}
                    autoComplete="off"
                />
            </div>

            {/* Dropdown */}
            {open && available.length > 0 && (
                <ul
                    ref={listRef}
                    id="tech-listbox"
                    role="listbox"
                    className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-card shadow-md"
                >
                    {available.map((t, i) => (
                        <li
                            key={t.name}
                            id={`tech-option-${i}`}
                            role="option"
                            aria-selected={i === activeIndex}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                add(t.name);
                            }}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={`cursor-pointer px-3 py-2 text-sm ${
                                i === activeIndex
                                    ? "bg-surface text-foreground"
                                    : "text-muted hover:bg-surface"
                            }`}
                        >
                            {t.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

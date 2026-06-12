export const inputClass =
    "w-full border border-border bg-card/70 rounded-lg px-3.5 py-2 text-smd placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent";

export const buttonClass =
    "cursor-pointer inline-flex items-center justify-center gap-1.5 bg-accent text-white dark:text-background px-5 py-2.5 rounded-full text-sm font-semibold shadow-[0_4px_16px_-8px_var(--accent)] hover:bg-accent-hover hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

// Compact variant of buttonClass for inline/nav contexts
export const buttonSmallClass =
    "cursor-pointer inline-flex items-center justify-center text-sm font-semibold bg-accent text-white dark:text-background px-4 py-1.5 rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const buttonSecondaryClass =
    "cursor-pointer inline-flex items-center justify-center gap-1.5 border border-border bg-card/60 px-5 py-2.5 rounded-full text-sm font-medium text-foreground/80 hover:text-accent hover:border-accent/50 transition-colors";

// Mono small-caps label for sections ("GitHub issue", "Activity", filter names...)
export const sectionLabelClass =
    "font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted";

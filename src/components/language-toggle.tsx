import { languages, setLang, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "inline-flex shrink-0 rounded-full border bg-card p-0.5 text-xs font-semibold",
        className,
      )}
    >
      {languages.map((l) => (
        <button
          key={l.id}
          role="radio"
          aria-checked={lang === l.id}
          aria-label={l.label}
          onClick={() => setLang(l.id)}
          className={cn(
            "h-8 min-w-9 rounded-full px-2.5 transition",
            lang === l.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="sm:hidden">{l.short}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}

export function useT() {
  return (s: string) => s;
}
export function useLang() {
  return "en" as const;
}
export const languages = [{ id: "en", label: "English", short: "EN" }] as const;
export function setLang(_l: string) {}

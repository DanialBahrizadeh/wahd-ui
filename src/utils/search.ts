const englishToPersianKeyboard: Record<string, string> = {
  q: "ض", w: "ص", e: "ث", r: "ق", t: "ف", y: "غ", u: "ع", i: "ه", o: "خ", p: "ح",
  "[": "ج", "]": "چ", a: "ش", s: "س", d: "ی", f: "ب", g: "ل", h: "ا", j: "ت",
  k: "ن", l: "م", ";": "ک", "'": "گ", z: "ظ", x: "ط", c: "ز", v: "ر", b: "ذ",
  n: "د", m: "پ", ",": "و", "\\": "ژ",
};

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fa")
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک");
}

function convertEnglishKeyboardToPersian(value: string) {
  return Array.from(value, (character) => englishToPersianKeyboard[character] ?? character).join("");
}

export function getSearchQueryVariants(query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return Array.from(new Set([
    normalizedQuery,
    convertEnglishKeyboardToPersian(normalizedQuery),
  ]));
}

export function matchesSearchQuery(value: string | number | undefined, queryVariants: string[]) {
  if (value === undefined) return false;
  const normalizedValue = normalizeSearchText(String(value));
  return queryVariants.some((query) => normalizedValue.includes(query));
}

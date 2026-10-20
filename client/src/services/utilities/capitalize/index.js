const connectingWords = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "nor",
  "for",
  "so",
  "yet",
  "as",
  "at",
  "by",
  "in",
  "of",
  "on",
  "to",
  "up",
  "via",
  "with",
  "from",
  "ng",
  "sa",
  "na",
  "ni",
  "o",
]);

const capitalize = (string) => {
  if (!string && string !== 0) return "-"; // covers null, undefined, ''
  if (typeof string === "number") return string;

  return String(string)
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && connectingWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

export default capitalize;

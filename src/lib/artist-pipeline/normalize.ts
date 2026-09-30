export function normalizeArtistName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (base === "") return name.trim().toLowerCase().replace(/\s+/g, " ");

  const stripped = base.replace(/^the\s+/, "");
  return stripped === "" ? base : stripped;
}

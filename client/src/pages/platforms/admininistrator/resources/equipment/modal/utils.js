const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const getExistingCategory = (
  collections = [],
  name = "",
  selectedId,
) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  return collections.find(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );
};

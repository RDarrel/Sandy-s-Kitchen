export const groupInclusions = (items = []) => {
  return items.reduce((groups, inclusion) => {
    const model =
      inclusion?.model === "Equipment"
        ? "Equipment"
        : inclusion?.model === "Services"
          ? "Services"
          : "Other inclusions";

    if (!groups[model]) {
      groups[model] = [];
    }

    groups[model].push(inclusion);

    return groups;
  }, {});
};
export const getInclusionUnit = (inclusion) => {
  const unit = inclusion?.unit;

  if (!unit || unit === "qty") {
    return "";
  }

  return unit;
};
export const getItemName = (inclusion) => {
  if (typeof inclusion?.item === "string") {
    return isObjectId(inclusion.item) ? "Resource" : inclusion.item;
  }

  return inclusion?.item?.name || inclusion?.item?.title || "Resource";
};

const isObjectId = (value = "") => {
  return /^[a-f\d]{24}$/i.test(String(value));
};

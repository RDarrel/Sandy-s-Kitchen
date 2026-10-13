import { formatItemName } from "../../utils";

export const getPrecalculatedIngredient = (
  ingredient,
  servings,
  recipeYield,
) => {
  const { inventory } = ingredient;
  const baseUnit = getIngredientUnit(ingredient);
  const qtyPerOrder = Number(ingredient?.qtyPerOrder || 0);
  const servingsCount = Number(servings);
  const calculatedQty = servingsCount / recipeYield;
  const consumed = qtyPerOrder * calculatedQty;
  const shouldConvertToLargerUnit =
    ["weight", "volume"].includes(inventory?.measurement) && consumed >= 1000;

  return {
    qty: formatQty(shouldConvertToLargerUnit ? consumed / 1000 : consumed),
    unit: shouldConvertToLargerUnit
      ? baseUnit === "ml"
        ? "l"
        : "kg"
      : baseUnit,
  };
};

export const getIngredientUnit = (ingredient) =>
  normalizeIngredientUnit(
    ingredient?.unit || ingredient?.inventory?.measurement || "pcs",
  );

export const normalizeIngredientUnit = (unit = "") => {
  const normalized = String(unit || "").toLowerCase();

  if (["pc", "piece", "pieces"].includes(normalized)) return "pcs";
  if (normalized === "weight") return "g";
  if (normalized === "volume") return "ml";
  if (normalized === "pieces") return "pcs";

  return normalized || "pcs";
};

export const getIngredientUnitOptions = (ingredient) => {
  const measurement = String(
    ingredient?.inventory?.measurement || "",
  ).toLowerCase();
  const unit = getIngredientUnit(ingredient);

  if (measurement === "weight" || ["g", "kg"].includes(unit))
    return ["g", "kg"];
  if (measurement === "volume" || ["ml", "l"].includes(unit))
    return ["ml", "l"];

  return ["pcs"];
};

export const convertIngredientQty = (qty, fromUnit, toUnit) => {
  const value = Number(qty || 0);

  if (!Number.isFinite(value) || fromUnit === toUnit) return formatQty(value);

  const unitFactor = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    pcs: 1,
  };

  const fromFactor = unitFactor[fromUnit] || 1;
  const toFactor = unitFactor[toUnit] || 1;

  return formatQty((value * fromFactor) / toFactor);
};

const formatQty = (qty) => {
  if (!Number.isFinite(qty)) return "0";

  return Number.isInteger(qty) ? String(qty) : qty.toFixed(2);
};

const getMenu = (item) => item?.menu || item;

export const getMenuKey = (item) => {
  const menu = getMenu(item);

  return item?._id || menu?._id || formatItemName(menu || item);
};

export const getMenuIngredients = (item) => {
  const menu = getMenu(item);

  return menu?.ingredients || item?.ingredients || [];
};

export const getIngredientKey = (ingredient, index) =>
  ingredient?._id ||
  ingredient?.inventory?._id ||
  `${formatIngredientName(ingredient)}-${index}`;

export const formatIngredientName = (ingredient) =>
  ingredient?.inventory?.name || ingredient?.name || "Ingredient";

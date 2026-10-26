// Base units:
// weight = grams (g)
// volume = milliliters (ml)
// count = pieces (pcs)

const unitConversion = {
  weight: {
    kg: 1000,
    g: 1,
  },
  volume: {
    l: 1000,
    ml: 1,
  },
  pieces: {
    pcs: 1,
  },
};

const unitMeasurementMap = {
  kg: "weight",
  g: "weight",
  l: "volume",
  ml: "volume",
  pcs: "pieces",
};

const normalizeUnit = (unit) => {
  const normalized = String(unit || "")
    .trim()
    .toLowerCase();

  if (["pc", "piece", "pieces"].includes(normalized)) return "pcs";
  return normalized;
};

const normalizeMeasurement = (measurement) => {
  return String(measurement || "")
    .trim()
    .toLowerCase();
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const inferMeasurementFromUnit = (unit) => {
  const normalizedUnit = normalizeUnit(unit);

  if (
    Object.prototype.hasOwnProperty.call(unitConversion.weight, normalizedUnit)
  )
    return "weight";
  if (
    Object.prototype.hasOwnProperty.call(unitConversion.volume, normalizedUnit)
  )
    return "volume";
  if (
    Object.prototype.hasOwnProperty.call(unitConversion.pieces, normalizedUnit)
  )
    return "pieces";

  return null;
};
const calculateConversionFactor = ({
  measurement,
  toMeasurement,
  sourceQty,
  sourceUnit,
  targetQty,
  targetUnit,
}) => {
  // Validate measurements
  if (
    !["weight", "volume", "pieces"].includes(measurement) ||
    !["weight", "volume", "pieces"].includes(toMeasurement)
  ) {
    throw new Error("Invalid measurement");
  }

  if (measurement === toMeasurement) {
    throw new Error("Source and target measurements must be different");
  }

  // Validate units
  if (
    unitMeasurementMap[sourceUnit] !== measurement ||
    unitMeasurementMap[targetUnit] !== toMeasurement
  ) {
    throw new Error("Units do not match their measurements");
  }

  // Validate quantities
  if (
    !Number.isFinite(sourceQty) ||
    !Number.isFinite(targetQty) ||
    sourceQty <= 0 ||
    targetQty <= 0
  ) {
    throw new Error("Quantities must be positive numbers");
  }

  // Normalize quantities
  const sourceBaseQty = convertToBaseUnit({
    measurement,
    qty: sourceQty,
    unit: sourceUnit,
  });

  const targetBaseQty = convertToBaseUnit({
    measurement: toMeasurement,
    qty: targetQty,
    unit: targetUnit,
  });

  // Target base units per 1 source base unit
  const factor = targetBaseQty / sourceBaseQty;

  if (!Number.isFinite(factor) || factor <= 0) {
    throw new Error("Invalid conversion factor");
  }

  return factor;
};
const convertToInventoryBaseUnit = ({ qty, unit, inventory }) => {
  const recipeMeasurement = inferMeasurementFromUnit(unit);

  if (!recipeMeasurement) {
    throw new Error(`Invalid recipe unit: ${unit}`);
  }

  const inventoryMeasurement = normalizeMeasurement(inventory.measurement);

  // Convert recipe quantity to its own base unit.
  const recipeBaseQty = convertToBaseUnit({
    measurement: recipeMeasurement,
    qty,
    unit,
  });

  // CASE 1: Same measurement
  // Example: 2 kg -> 2000 g
  if (recipeMeasurement === inventoryMeasurement) {
    return recipeBaseQty;
  }

  // CASE 2: Different measurement
  // Example: 300 ml -> 500 g Calamansi
  const conversion = inventory.conversions?.find(
    ({ toMeasurement }) =>
      normalizeMeasurement(toMeasurement) === recipeMeasurement,
  );

  const factor = Number(conversion?.factor);

  if (!Number.isFinite(factor) || factor <= 0) {
    throw new Error(
      `Missing or invalid conversion for ${inventory.name}: ${unit}`,
    );
  }

  return recipeBaseQty / factor;
};

const convertToBaseUnit = ({ measurement, qty, unit }) => {
  const normalizedMeasurement = normalizeMeasurement(measurement);
  const normalizedUnit = normalizeUnit(unit);

  const measurementKey =
    unitConversion[normalizedMeasurement] !== undefined
      ? normalizedMeasurement
      : inferMeasurementFromUnit(normalizedUnit);

  const multiplier = unitConversion[measurementKey]?.[normalizedUnit];

  if (!multiplier) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  return toNumber(qty) * multiplier;
};

const convertFromBaseUnit = ({ measurement, qty, unit }) => {
  const normalizedMeasurement = normalizeMeasurement(measurement);
  const normalizedUnit = normalizeUnit(unit);

  const measurementKey =
    unitConversion[normalizedMeasurement] !== undefined
      ? normalizedMeasurement
      : inferMeasurementFromUnit(normalizedUnit);

  const divider = unitConversion[measurementKey]?.[normalizedUnit];

  if (!divider) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  return toNumber(qty) / divider;
};

module.exports = {
  convertToBaseUnit,
  convertFromBaseUnit,
  convertToInventoryBaseUnit,
  calculateConversionFactor,
};

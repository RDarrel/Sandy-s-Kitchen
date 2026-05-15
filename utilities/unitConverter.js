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
    Object.prototype.hasOwnProperty.call(unitConversion.count, normalizedUnit)
  )
    return "count";

  return null;
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
};

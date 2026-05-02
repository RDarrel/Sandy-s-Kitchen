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
  count: {
    pcs: 1,
  },
};

const normalizeUnit = (unit) => {
  return String(unit || "")
    .trim()
    .toLowerCase();
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

const convertToBaseUnit = ({ measurement, qty, unit }) => {
  const normalizedMeasurement = normalizeMeasurement(measurement);
  const normalizedUnit = normalizeUnit(unit);

  const multiplier = unitConversion[normalizedMeasurement]?.[normalizedUnit];

  if (!multiplier) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  return toNumber(qty) * multiplier;
};

const convertFromBaseUnit = ({ measurement, qty, unit }) => {
  const normalizedMeasurement = normalizeMeasurement(measurement);
  const normalizedUnit = normalizeUnit(unit);

  const multiplier = unitConversion[normalizedMeasurement]?.[normalizedUnit];

  if (!multiplier) {
    throw new Error(`Invalid unit: ${unit}`);
  }

  return toNumber(qty) / multiplier;
};

module.exports = {
  convertToBaseUnit,
  convertFromBaseUnit,
};

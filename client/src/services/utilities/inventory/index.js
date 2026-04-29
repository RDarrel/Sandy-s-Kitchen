const unitAbbr = {
  weight: "kg",
  volume: "L",
  pieces: "pcs",
};

const unitFull = {
  weight: "Kilograms",
  volume: "Liters",
  pieces: "Pieces",
};
const Inventory = {
  getUnitByMeasurement: (measurement, isAbbr = true) => {
    const baseUnitMap = isAbbr ? unitAbbr : unitFull;
    return baseUnitMap[measurement] || "";
  },
};

export default Inventory;

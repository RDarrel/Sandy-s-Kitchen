const unitMap = {
  weight: "Kg",
  volume: "L",
  pieces: "Pcs",
};
const Stock = {
  convertToBaseUnit: (value, type, useNumber = false) => {
    const baseUnit = unitMap[type];
    let unit = 0;

    switch (type) {
      case "weight":
        unit = value / 1000; // g → kg
        break;
      case "volume":
        unit = value / 1000; // ml → L
        break;
      default:
        unit = value;
    }

    const formatted = parseFloat(unit.toFixed(2));

    return useNumber ? formatted : `${formatted} ${baseUnit}`;
  },
  getStatus: (_stock, measurement) => {
    const stock = Number(_stock) || 0;
    if (measurement === "pieces") {
      if (stock <= 10) return "Out of Stock";
      if (stock <= 30) return "Low Stock";
      return "In Stock";
    }

    if (stock <= 1000) return "Out of Stock";
    if (stock <= 3000) return "Low Stock";
    return "In Stock";
  },

  getUnit: (measurement) => {
    const map = {
      weight: "kg",
      volume: "L",
      pieces: "pc",
    };
    return map[measurement];
  },
};
export default Stock;

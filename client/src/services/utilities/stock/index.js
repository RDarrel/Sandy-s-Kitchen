const unitMap = {
  weight: "Kg",
  volume: "L",
  pieces: "Pcs",
};
const Stock = {
  convertToBaseUnit: (value, type, useNumber = false) => {
    const baseUnit = unitMap[type];
    var unit = 0;
    switch (type) {
      case "weight":
        unit = value / 1000; // g → kg
      case "volume":
        unit = value / 1000; // ml → L
      default:
        unit = value;
    }
    return useNumber ? Number(unit) : `${unit} ${baseUnit}`;
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
};
export default Stock;

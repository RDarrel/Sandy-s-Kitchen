import { capitalize } from "lodash";

const unitMap = {
  weight: "Kg",
  volume: "L",
  pieces: "Pcs",
};
const Stock = {
  format: (stock) => {
    const value = Number(stock || 0);

    const truncated = Math.floor(value * 100) / 100;

    return truncated.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  },
  display: (stock, measurement, hasMeasurement = true) => {
    const value = Number(stock || 0);

    const truncated = Math.floor(value * 100) / 100;

    const formatted = truncated.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${formatted} ${hasMeasurement ? capitalize(unitMap[measurement]) : ""}`;
  },

  convertToBaseUnit: (amount, unit) => {
    if (["kg", "l"].includes(unit)) {
      return amount * 1000;
    }
    return amount;
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

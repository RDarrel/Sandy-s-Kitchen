import { capitalize } from "lodash";

const unitMap = {
  weight: "Kg",
  volume: "L",
  pieces: "Pcs",
};

const formattedUnitMap = {
  kg: "kg",
  g: "g",
  ml: "mL",
  l: "L",
  pcs: "pcs",
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

  convertToBaseUnit: (amount, unit = "pcs") => {
    if (["kg", "l"].includes(unit?.toLowerCase())) {
      return amount * 1000;
    }
    return Number(amount);
  },

  formatQuantity: (amount, unit, normalizeUnit = false) => {
    const qty = Number(amount) || 0;

    if (unit === "g" && (qty >= 1000 || normalizeUnit)) {
      return `${Number((qty / 1000).toFixed(2))} Kg`;
    }

    if (unit === "ml" && (qty >= 1000 || normalizeUnit)) {
      return `${Number((qty / 1000).toFixed(2))} L`;
    }

    return `${Math.round(qty)} ${formattedUnitMap[unit] || unit}`;
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

  //For Stock Planning only
  getPurchaseDetails: (item) => {
    const { projectedStock, suggestedPurchaseQty } = item;
    const { min } = item?.stock;
    const minimumStock = Stock.convertToBaseUnit(
      min,
      Stock.getUnit(item?.measurement),
    );

    const minimumStockGap = Math.max(0, minimumStock - Number(projectedStock));

    const toPurchaseQty = Math.max(
      Number(suggestedPurchaseQty),
      minimumStockGap,
    );
    const isBelowMinStock = projectedStock < minimumStock;

    return { isBelowMinStock, toPurchaseQty, minimumStock };
  },
};
export default Stock;

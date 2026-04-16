export const typeOptions = [
  { label: "Ingredient", value: "ingredient" },
  { label: "Resell", value: "resell" },
];

export const categoryOptions = {
  ingredient: [
    { label: "Meat", value: "meat" },
    { label: "Vegetable", value: "vegetable" },
    { label: "Seafood", value: "seafood" },
    { label: "Grain", value: "grain" },
    { label: "Dairy", value: "dairy" },
    { label: "Condiment", value: "condiment" },
    { label: "Other", value: "other" },
  ],
  resell: [
    { label: "Beverage", value: "beverage" },
    { label: "Snack", value: "snack" },
    { label: "Other", value: "other" },
  ],
};

export const measurementOptions = [
  { label: "Weight", value: "weight", unit: "g" },
  { label: "Volume", value: "volume", unit: "ml" },
  { label: "Pieces", value: "pieces", unit: "pcs" },
];

export const stockOptions = [
  { label: "Healthy", value: "healthy" },
  { label: "Low", value: "low" },
  { label: "Critical", value: "critical" },
];

export const unitMap = {
  weight: "g",
  volume: "ml",
  count: "pcs",
};

export const emptyForm = {
  _id: "",
  name: "",
  type: "ingredient",
  category: "other",
  measurement: "weight",
  baseUnit: "g",
  currentStock: "",
  description: "",
};

export const statusClasses = {
  healthy:
    "border-[color:color-mix(in_srgb,var(--color-chart-2)_35%,white)] bg-[color:color-mix(in_srgb,var(--color-chart-2)_14%,white)] text-[color:color-mix(in_srgb,var(--color-chart-4)_78%,black)]",
  low: "border-accent/40 bg-accent/15 text-accent-foreground",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
};

export const buildPayload = (form) => ({
  ...form,
  currentStock: Number(form.currentStock) || 0,
  baseUnit: unitMap[form.measurement],
});

export const getStockStatus = (item) => {
  const stock = Number(item.currentStock) || 0;

  if (item.measurement === "count") {
    if (stock <= 10) return "critical";
    if (stock <= 30) return "low";
    return "healthy";
  }

  if (stock <= 1000) return "critical";
  if (stock <= 3000) return "low";
  return "healthy";
};

export const formatStock = (stock, unit) => {
  const value = Number(stock) || 0;
  return `${new Intl.NumberFormat().format(value)} ${unit}`;
};

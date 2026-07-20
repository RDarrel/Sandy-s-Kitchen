export const INITIAL_FORM = {
  name: "",
  description: "",
  availableFor: [],
};

export const TYPES = [
  {
    value: "fixed",
    label: "One-Time",
    description: "Included once. No additional details required.",
  },
  {
    value: "hourly",
    label: "Hourly",
    description: "Specify the number of hours for this service.",
  },
  {
    value: "quantity",
    label: "By Quantity",
    description: "Specify the required quantity for this service.",
  },
];

export const CATEGORIES = [
  "Food & Beverage",
  "Setup",
  "Decoration",
  "Staff",
  "Media",
  "Entertainment",
  "Others",
];

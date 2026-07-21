export const INITIAL_FORM = {
  name: "",
  description: "",
  requirement: "none",
  category: "Decoration",
  availableFor: [],
};

export const REQUIREMENTS = [
  {
    value: "none",
    label: "None",
    description: "No additional details are required for this service.",
  },
  {
    value: "hours",
    label: "Hours",
    description: "Specify how long this service will be provided.",
  },
  {
    value: "quantity",
    label: "Quantity",
    description: "Specify the number needed for this service.",
  },
];

export const CATEGORIES = [
  "Food & Beverage",
  "Setup & Logistics",
  "Decoration",
  "Staff Services",
  "Audio & Visual",
  "Entertainment",
  // "Venue Services",
  "Other",
];

const CateringPackage = require("../../models/events/CateringPackage");

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const getNumberFilter = ({ min, max, field, integer = false, minimum = 0 }) => {
  const filter = {};

  const parseNumber = (value) => {
    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      (integer && !Number.isInteger(number)) ||
      number < minimum
    ) {
      throw new Error(`Invalid ${field}.`);
    }

    return number;
  };

  if (hasValue(min)) {
    filter.$gte = parseNumber(min);
  }

  if (hasValue(max)) {
    filter.$lte = parseNumber(max);
  }

  if (
    filter.$gte !== undefined &&
    filter.$lte !== undefined &&
    filter.$gte > filter.$lte
  ) {
    throw new Error(`Invalid ${field} range.`);
  }

  return Object.keys(filter).length > 0 ? filter : null;
};

const search = async ({
  minPax,
  maxPax,
  minBudget,
  maxBudget,
  sortBy = "recommended",
} = {}) => {
  const filter = {
    isAvailable: true,
    deletedAt: null,
  };

  /*
  |--------------------------------------------------------------------------
  | Number of Guests
  |--------------------------------------------------------------------------
  */

  const guestsFilter = getNumberFilter({
    min: minPax,
    max: maxPax,
    field: "number of guests",
    integer: true,
    minimum: 1,
  });

  if (guestsFilter) {
    filter.includedGuests = guestsFilter;
  }

  /*
  |--------------------------------------------------------------------------
  | Budget
  |--------------------------------------------------------------------------
  */

  const budgetFilter = getNumberFilter({
    min: minBudget,
    max: maxBudget,
    field: "budget",
    minimum: 0,
  });

  if (budgetFilter) {
    filter.basePrice = budgetFilter;
  }

  /*
  |--------------------------------------------------------------------------
  | Sort
  |--------------------------------------------------------------------------
  */

  const sortOptions = {
    recommended: { createdAt: -1 },
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
  };

  const sort = sortOptions[sortBy] || sortOptions.recommended;

  /*
  |--------------------------------------------------------------------------
  | Query Catering Packages
  |--------------------------------------------------------------------------
  */

  const packages = await CateringPackage.find(filter)
    .sort(sort)
    .populate([
      {
        path: "inclusions.item",
        select: "name requirement category",
      },
      {
        path: "mainCourseCategories.category",
        select: "name",
      },
      {
        path: "mainCourseCategories.choices",
        select: "name",
      },
      {
        path: "sideMenuCategories.category",
        select: "name",
      },
      {
        path: "sideMenuCategories.choices",
        select: "name",
      },
    ])
    .lean();

  return packages;
};

module.exports = {
  search,
};

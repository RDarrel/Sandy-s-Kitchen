import { Formatter, Stock } from "@/services/utilities";
import { capitalize } from "lodash";
import { Building2, Sparkles, Utensils } from "lucide-react";
import { getPrecalculatedIngredient } from "./service/dishes/utils";

export const getServiceRows = (booking) => {
  const rows = [];
  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    rows.push({
      type: "venue",

      icon: Building2,

      iconClassName: "text-amber-700",

      name: booking?.venue?.item?.name || "Venue reservation",

      subtitle: booking?.venue?.item?.setting || "Event venue",

      pax: booking?.venue?.pax || 0,

      time: booking?.venue?.schedule,

      label: "Venue",

      accentClassName: "border-l-2 border-l-amber-500",

      location: booking?.venue?.item?.address,

      inclusions: booking?.venue?.inclusions || [],

      pricing: booking?.pricing?.venue,
    });
  }
  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    rows.push({
      type: "catering",

      icon: Utensils,

      iconClassName: "text-rose-700",

      name: booking?.catering?.item?.name || "Catering package",

      subtitle: "Food service",

      pax: booking?.catering?.pax || 0,

      time: booking?.catering?.schedule,

      label: "Catering",

      accentClassName: "border-l-2 border-l-rose-500",

      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        booking?.venue?.item?.address,
      address: booking?.catering?.venue?.address,

      mainDishes: booking?.catering?.mainDishes || [],

      sideDishes: booking?.catering?.sideDishes || [],

      inclusions: booking?.catering?.inclusions || [],

      pricing: booking?.pricing?.catering,
    });
  }

  if (rows.length === 0) {
    rows.push({
      type: "booking",

      icon: Sparkles,

      iconClassName: "text-muted-foreground",

      name: "Booking details",

      subtitle: "No service details available",

      pax: 0,

      time: {},

      label: "Booking",

      accentClassName: "border-l-2 border-l-muted-foreground",

      location: "-",

      inclusions: [],

      pricing: null,
    });
  }

  return rows;
};

export const getPaymentSummary = (booking) => {
  const total =
    Number(booking?.pricing?.total || 0) ||
    Number(booking?.pricing?.catering?.total || 0) +
      Number(booking?.pricing?.venue?.total || 0) ||
    Number(booking?.meta?.amount || 0);

  const received = Number(
    booking?.payment?.amount || booking?.payment?.received || 0,
  );

  return {
    total,

    received,

    balance: Math.max(total - received, 0),

    status:
      booking?.payment?.status ||
      (received >= total && total > 0
        ? "paid"
        : received > 0
          ? "partial"
          : "unpaid"),
  };
};

export const getTotalPax = (booking) => {
  if (booking.bookingType === "both") {
    return Math.max(
      Number(booking?.catering?.pax || 0),
      Number(booking?.venue?.pax || 0),
    );
  }

  return Number(booking?.[booking.bookingType]?.pax || 0);
};

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

export const formatDate = (date) => {
  if (!date) return "-";

  return Formatter.date(date);
};

/*
|--------------------------------------------------------------------------
| FORMAT ITEM NAME
|--------------------------------------------------------------------------
*/

export const formatItemName = (item) => {
  if (!item) return "-";

  if (typeof item === "string") {
    return item;
  }

  return item.name || item.title || item.description || "-";
};

/*
|--------------------------------------------------------------------------
| CAPITALIZE LABEL
|--------------------------------------------------------------------------
*/

export const capitalizeLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const requiresResourceInput = (inclusion) => {
  if (inclusion.model == "Services") return false;
  const unit = getResourceRequirement(inclusion);

  return ["qty", "hrs"].includes(unit);
};
export const getResourceUnit = (inclusion) => {
  if (inclusion?.model === "Equipment" && inclusion?.item?.unit) {
    return inclusion.item.unit;
  }

  const unit = getResourceRequirement(inclusion);

  return unit === "none" ? "Qty" : unit;
};

export const getResourceRequirement = (inclusion) =>
  String(
    inclusion?.unit ||
      inclusion?.item?.requirement ||
      (inclusion?.model === "Equipment" ? "qty" : "none"),
  ).toLowerCase();

export const buildInclusions = (inclusions = []) =>
  inclusions?.map((inc) => ({ ...inc, item: inc?.item?._id }));

const buildIngredients = (
  menu,
  servings,
  recipeYield,
  bookingIngredients = [],
) => {
  return menu?.ingredients?.map((ing) => {
    const manualAdjustment = bookingIngredients.find(
      ({ inventory }) => inventory === ing?.inventory?._id,
    );
    if (manualAdjustment) {
      return manualAdjustment;
    } else {
      const preCalculated = getPrecalculatedIngredient(
        ing,
        servings,
        recipeYield,
      );
      return {
        inventory: ing?.inventory?._id,
        requiredQty: Number(preCalculated?.qty),
        unit: preCalculated?.unit,
      };
    }
  });
};

export const buildBookingToUpdate = (booking) => {
  const { catering = {}, bookingType = "venue" } = booking;

  const attachIngredients = (dishes) => {
    if (dishes?.length === 0 || !dishes) return [];
    return dishes.map((dish) => {
      const { servings, menu, ingredients } = dish;
      const baseServings = servings || catering?.pax;
      const baseRecipeYield = dish?.recipeYield || menu?.recipeYield || 1;

      return {
        menu: dish?.menu?._id,
        servings: baseServings,
        recipeYield: baseRecipeYield,
        ingredients: buildIngredients(
          menu,
          baseServings,
          baseRecipeYield,
          ingredients,
        ),
      };
    });
  };

  const cateringToUpdate = {
    ...booking?.catering,
    ...(catering?.mainDishes?.length > 0 && {
      mainDishes: attachIngredients(catering?.mainDishes),
    }),
    ...(catering?.sideDishes?.length > 0 && {
      sideDishes: attachIngredients(catering?.sideDishes),
    }),
    inclusions: buildInclusions(booking?.catering?.inclusions),
    item: booking?.catering?.item?._id,
  };

  const venueToUpdate = {
    ...booking?.venue,
    inclusions: buildInclusions(booking?.venue?.inclusions),
    item: booking?.venue?.item?._id,
  };

  const toUpdateService = {
    both: {
      venue: venueToUpdate,
      catering: cateringToUpdate,
    },
    catering: { catering: cateringToUpdate },
    venue: { venue: venueToUpdate },
  };

  return {
    _id: booking?._id,
    ...toUpdateService[bookingType],
  };
};

export const getEquipmentAllocations = (booking = {}) => {
  const getEquipments = (inclusions = []) =>
    (inclusions || []).filter(({ model }) => model === "Equipment");

  const { bookingType, catering = {}, venue = {} } = booking || {};

  const equipmentMap = {
    venue: getEquipments(venue?.inclusions),
    catering: getEquipments(catering?.inclusions),
  };

  if (bookingType !== "both") {
    return (equipmentMap[bookingType] || []).map((equipment) => ({
      ...equipment,
      source: bookingType,
      label: capitalize(bookingType),
    }));
  }

  const venueEquipmentIds = new Set(
    equipmentMap.venue.map(({ item }) => String(item?._id)),
  );

  const cateringEquipmentIds = new Set(
    equipmentMap.catering.map(({ item }) => String(item?._id)),
  );

  const venueEquipments = equipmentMap.venue.map((equipment) => {
    const isShared = cateringEquipmentIds.has(String(equipment?.item?._id));

    return {
      ...equipment,
      source: "venue",
      label: isShared ? "Venue + Catering" : "Venue",
    };
  });

  const cateringEquipments = equipmentMap.catering
    .filter(({ item }) => !venueEquipmentIds.has(String(item?._id)))
    .map((equipment) => ({
      ...equipment,
      source: "catering",
      label: "Catering",
    }));

  return [...venueEquipments, ...cateringEquipments];
};
export const getIngredientIds = (booking) => {
  const { mainDishes = [], sideDishes = [] } = booking?.catering ?? {};

  const dishes = [...mainDishes, ...sideDishes];

  const ingredientIds = [
    ...new Set(
      dishes.flatMap(({ menu }) =>
        (menu?.ingredients ?? [])
          .map(({ inventory }) => inventory?._id ?? inventory)
          .filter(Boolean)
          .map(String),
      ),
    ),
  ];

  return ingredientIds;
};

export const getIngredientShortages = (booking, ingredientStocks = []) => {
  const { mainDishes = [], sideDishes = [] } = booking?.catering ?? {};

  const dishes = [...(mainDishes ?? []), ...(sideDishes ?? [])];

  const requiredQuantities = new Map();

  dishes.forEach((element) => {
    const {
      ingredients: bookingIngredients = [],
      menu,
      servings = null,
    } = element;

    const baseServings = servings ?? booking?.catering?.pax;

    menu?.ingredients?.forEach((ingredient) => {
      const inventoryId = String(ingredient?.inventory?._id);

      const saved = bookingIngredients.find(
        ({ inventory }) => inventory === inventoryId,
      );

      const ingredientConsumed = saved
        ? {
            unit: saved.unit,
            qty: saved.requiredQty,
          }
        : getPrecalculatedIngredient(
            ingredient,
            baseServings,
            menu?.recipeYield || 1,
          );

      const requiredQty = Number(
        Stock.convertToBaseUnit(
          ingredientConsumed.qty,
          ingredientConsumed.unit,
        ) || 0,
      );

      requiredQuantities.set(
        inventoryId,
        Number((requiredQuantities.get(inventoryId) ?? 0) + requiredQty),
      );
    });
  });

  const stockMap = new Map(
    ingredientStocks.map((item) => [String(item._id), item]),
  );

  const shortages = [...requiredQuantities].flatMap(
    ([inventoryId, requiredQty]) => {
      const item = stockMap.get(inventoryId);

      // Missing stock data should not be treated as sufficient.
      if (!item) {
        return [
          {
            inventory: inventoryId,
            requiredQty,
            currentStock: null,
            shortageQty: null,
            missingStockData: true,
          },
        ];
      }

      const currentStock = Number(item.stock?.current ?? 0);

      if (requiredQty <= currentStock) {
        return [];
      }

      return [
        {
          ...item,
          inventory: inventoryId,
          requiredQty,
          currentStock,
          shortageQty: requiredQty - currentStock,
          missingStockData: false,
        },
      ];
    },
  );

  return {
    hasIngredientShortage: shortages.length > 0,
    shortages,
  };
};

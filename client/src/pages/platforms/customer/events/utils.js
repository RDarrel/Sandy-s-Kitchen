import { Formatter } from "@/services/utilities";
import { toast } from "sonner";

export const computeEstimated = ({
  basePrice,
  maxHours,
  time = {},
  addFee = {},
  pax = {},
}) => {
  const paxRate = addFee?.pax;
  const hourRate = addFee?.hour;
  const extraGuests = Math.max(0, pax.avail - pax.max);
  const extraGuestFee = extraGuests * paxRate;
  const extraHours = Math.max(
    0,
    Formatter.duration(time?.start, time?.end, true) - maxHours,
  );
  const extraHourFee = Math.round(extraHours * hourRate);

  return {
    basePrice,
    guests: {
      included: pax?.max,
      booked: pax?.avail,
      extra: Math.max(0, pax?.avail - pax?.max),
      rate: paxRate,
      charge: extraGuestFee,
    },
    duration: {
      included: maxHours,
      booked: Math.round(Formatter.duration(time?.start, time?.end, true)),
      extra: Math.round(extraHours),
      rate: hourRate,
      charge: extraHourFee,
    },
    total: Math.round(basePrice + extraGuestFee + extraHourFee),
  };
};

export const buildPackageInfo = (item = {}) => {
  const sideMenuLimit = (item?.sideMenuCategories || []).reduce(
    (acc, category) => acc + (Number(category?.limit) || 0),
    0,
  );

  return {
    _id: item?._id,
    imgId: item?.imgId,
    name: item?.name || "Selected Package",
    level: item?.level,
    description: item?.description,
    includedGuests: Number(item?.includedGuests) || 1,
    basePrice: Number(item?.basePrice) || 0,
    addPricePerGuest: Number(item?.addPricePerGuest) || 0,
    addPricePerHour: Number(item?.addPricePerHour) || 0,
    includedHours: Number(item?.includedHours) || 0,
    mainCourseLimit: Number(item?.mainCourseLimit) || 0,
    sideMenuLimit,
    inclusions: item?.inclusions || [],
    mainCourseCategories: item?.mainCourseCategories || [],
    sideMenuCategories: item?.sideMenuCategories || [],
  };
};
export const buildInclusions = (inclusions) => {
  if (!inclusions?.length) return [];
  return inclusions.map((inc) => ({ ...inc, item: inc?.item?._id, amount: 0 }));
};
export const buildPayload = (form, menuSelections, estimate) => {
  const { bookingType } = form;
  const isBoth = form?.bookingType === "both";
  const catering = {
    ...form?.catering,
    mainDishes: Object.values(menuSelections?.main).flat(),
    sideDishes: Object.values(menuSelections?.side).flat(),
  };
  const _form = {
    ...form,
    catering,
  };

  const payload = {
    ...(isBoth
      ? { venue: form?.venue, catering }
      : { [bookingType]: _form[bookingType] }),
    contact: form?.contact,
    date: form?.date,
    eventType: form?.eventType,
    notes: form?.notes,
    bookingType: form?.bookingType,
    pricing: {
      ...(isBoth ? estimate : { [bookingType]: estimate[bookingType] }),
      total: (estimate?.catering?.total || 0) + (estimate?.venue?.total || 0),
    },
  };

  return payload;
};

export const onMenuToggle = (
  type,
  category,
  menu,
  limit,
  menuSelections,
  selectedMainCount,
  selectedSideCount,
  packageInfo,
) => {
  const categoryId = category?._id;
  const menuId = menu?._id;

  const group = menuSelections[type] || {};
  const current = group[categoryId] || [];

  const isSelected = current.includes(menuId);

  const nextCategorySelections = isSelected
    ? current.filter((id) => id !== menuId)
    : [...current, menuId];

  if (!isSelected && nextCategorySelections.length > limit) {
    toast.warning(
      `${category?.name} allows ${limit} selection${limit > 1 ? "s" : ""}.`,
    );

    return null;
  }

  if (
    !isSelected &&
    type === "main" &&
    selectedMainCount >= packageInfo.mainCourseLimit
  ) {
    toast.warning(
      `This package allows up to ${packageInfo.mainCourseLimit} main courses.`,
    );

    return null;
  }

  if (
    !isSelected &&
    type === "side" &&
    selectedSideCount >= packageInfo.sideMenuLimit
  ) {
    toast.warning(
      `This package allows up to ${packageInfo.sideMenuLimit} side menus.`,
    );

    return null;
  }

  return {
    ...menuSelections,
    [type]: {
      ...group,
      [categoryId]: nextCategorySelections,
    },
  };
};

export const getSelectedMenus = (categories = [], selections = {}) => {
  return categories.flatMap((c) => {
    const selectedIds = selections[c?.category?._id] || [];
    return (c?.choices || []).filter((menu) => selectedIds.includes(menu?._id));
  });
};

import { format, isSameYear, isValid as isValidDate } from "date-fns";
import { createElement } from "react";
import { toast } from "sonner";

const formatScheduleDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (!isValidDate(date)) return "—";

  const dateFormat = isSameYear(date, new Date())
    ? "MMM d, h:mm a"
    : "MMM d, yyyy, h:mm a";

  return format(date, dateFormat);
};
const showScheduleError = (title, message, date) => {
  toast.error(title, {
    description: createElement(
      "span",
      null,
      message + " ",
      createElement(
        "strong",
        {
          style: { fontWeight: 600 },
        },
        formatScheduleDate(date),
      ),
      ".",
    ),
    duration: 6000,
  });
};

const step1 = (form) => {
  const { bookingType = "", catering = {}, venue = {} } = form;
  const venueSchedule = venue?.schedule ?? {};
  const cateringSchedule = catering?.schedule ?? {};

  // Validate booking type
  if (!bookingType) {
    toast.error("Venue option is required", {
      description: "Please select whether you want to book a venue.",
      duration: 4000,
    });
    return false;
  }

  // Catering only
  if (bookingType === "catering") {
    return true;
  }

  if (
    venueSchedule?.startAt &&
    venueSchedule?.endAt &&
    cateringSchedule?.startAt &&
    cateringSchedule?.endAt
  ) {
    // Catering cannot start before the venue
    if (new Date(cateringSchedule.startAt) < new Date(venueSchedule.startAt)) {
      showScheduleError(
        "Catering starts too early",
        "Catering must start on or after",
        venueSchedule.startAt,
      );

      return false;
    }

    // Catering cannot end after the venue
    if (new Date(cateringSchedule.endAt) > new Date(venueSchedule.endAt)) {
      showScheduleError(
        "Catering ends too late",
        "Catering must end on or before",
        venueSchedule.endAt,
      );

      return false;
    }
  }

  // Validate venue capacity
  if (bookingType === "both" && venue?.pax < catering?.pax) {
    toast.error("Guest count exceeds venue capacity", {
      description: `The venue can accommodate up to ${venue.pax} guests, but ${catering.pax} guests are selected for catering. Please adjust the catering guest count.`,
      duration: 6000,
    });
    return false;
  }

  return true;
};

const step2 = (selected, menuSelections) => {
  const mainDishes = Object.values(menuSelections?.main || {}).flat();

  if (mainDishes?.length < selected?.mainCourseLimit) {
    toast.error(
      `Please select ${selected.mainCourseLimit} main dishes to continue.`,
    );
    return false;
  }

  return true;
};
const step3 = (selected, menuSelections) => {
  const sideDishMax = selected?.sideMenuCategories?.reduce(
    (acc, curr) => curr?.limit + acc,
    0,
  );
  const sideDishSelected = Object.values(menuSelections?.side || {}).flat();
  console.log("sideDishmAX", sideDishMax, "selected", sideDishSelected?.length);
  if (sideDishSelected?.length < sideDishMax) {
    const remaining = sideDishMax - sideDishSelected.length;

    toast.error(
      `Please select ${remaining} more side dish${remaining > 1 ? "es" : ""} to continue.`,
    );

    return false;
  }
  return true;
};

const step4 = (form) => {
  const { venue } = form;
  if (!venue?.item) {
    toast.error("Please select a venue to continue.");
    return false;
  }
  return true;
};
const isValid = (currentStep, form, menuSelections, selected) => {
  if (currentStep === 1) return step1(form);
  if (form?.bookingType === "both") {
    if (currentStep === 2) return step4(form);
    if (currentStep === 3) return step2(selected, menuSelections);
    if (currentStep === 4) return step3(selected, menuSelections);
  } else {
    if (currentStep === 2) return step2(selected, menuSelections);
    if (currentStep === 3) return step3(selected, menuSelections);
  }
  return true;
};

export default isValid;

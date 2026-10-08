import { Formatter } from "@/services/utilities";
import { toast } from "sonner";

const step1 = (form) => {
  const { bookingType = "", venue = {}, catering = {} } = form;
  const venueSchedule = venue?.schedule ?? {};
  const cateringSchedule = catering?.schedule ?? {};
  // Validate booking type
  if (!bookingType) {
    toast.error("Catering option is required", {
      description: "Please select whether you want to book a catering package.",
      duration: 4000,
    });
    return false;
  }

  // Validate venue time
  if (venueSchedule?.startAt && venueSchedule?.endAt) {
    if (new Date(venueSchedule.startAt) >= new Date(venueSchedule.endAt)) {
      toast.error("Invalid venue schedule", {
        description: `The venue starts on ${Formatter.date(venueSchedule.startAt, true)} and ends on ${Formatter.date(venueSchedule.endAt, true)}. The end date and time must be later than the start date and time.`,
        duration: 6000,
      });
      return false;
    }
  }

  if (
    cateringSchedule?.startAt &&
    venueSchedule?.startAt &&
    new Date(cateringSchedule.startAt) < new Date(venueSchedule.startAt)
  ) {
    toast.error("Catering schedule is outside venue hours", {
      description: `Catering starts on ${Formatter.date(cateringSchedule.startAt, true)}, but the venue reservation begins on ${Formatter.date(venueSchedule.startAt, true)}. Please adjust the catering start date and time.`,
      duration: 6000,
    });
    return false;
  }

  // Catering cannot end after venue
  if (
    cateringSchedule?.endAt &&
    venueSchedule?.endAt &&
    new Date(cateringSchedule.endAt) > new Date(venueSchedule.endAt)
  ) {
    toast.error("Catering schedule is outside venue hours", {
      description: `Catering ends on ${Formatter.date(cateringSchedule.endAt, true)}, but the venue reservation ends on ${Formatter.date(venueSchedule.endAt, true)}. Please adjust the catering end date and time.`,
      duration: 6000,
    });
    return false;
  }

  // Validate venue capacity
  if (bookingType === "both") {
    if (venue?.pax < catering?.pax) {
      toast.error("Guest count exceeds venue capacity", {
        description: `The venue can accommodate up to ${venue.pax} guests, but ${catering.pax} guests are selected for catering. Please adjust the catering guest count.`,
        duration: 6000,
      });
      return false;
    } else if (catering?.pax > venue?.px) {
      toast.error("Catering guests exceed venue capacity", {
        description: `You selected ${catering.pax} catering guests, but your venue booking is for up to ${venue.pax} guests. Please reduce the catering guest count.`,
        duration: 6000,
      });
      return false;
    }
  }
  return true;
};

const step2 = (form) => {
  const { catering } = form;
  if (!catering?.item) {
    toast.error("Please select a catering package to continue.");
    return false;
  }
  return true;
};

const step4 = (selected, menuSelections) => {
  const mainDishes = Object.values(menuSelections?.main || {}).flat();

  if (mainDishes?.length < selected?.mainCourseLimit) {
    toast.error(
      `Please select ${selected.mainCourseLimit - mainDishes?.length} main dishes to continue.`,
    );
    return false;
  }

  return true;
};
const step5 = (selected, menuSelections) => {
  const sideDishMax = selected?.sideMenuCategories?.reduce(
    (acc, curr) => curr?.limit + acc,
    0,
  );

  const sideDishSelected = Object.values(menuSelections?.side || {}).flat();
  if (sideDishSelected?.length < sideDishMax) {
    const remaining = sideDishMax - sideDishSelected.length;

    toast.error(
      `Please select ${remaining} more side dish${remaining > 1 ? "es" : ""} to continue.`,
    );

    return false;
  }
  return true;
};

const isValid = (currentStep, form, menuSelections, selected) => {
  if (currentStep === 1) return step1(form);
  if (form?.bookingType === "both") {
    if (currentStep === 2) return step2(form);
    if (currentStep === 3) return step4(selected, menuSelections);
    if (currentStep === 4) return step5(selected, menuSelections);
  }
  // if (form?.bookingType === "both" && currentStep === 4) return step4(form);
  return true;
};

export default isValid;
